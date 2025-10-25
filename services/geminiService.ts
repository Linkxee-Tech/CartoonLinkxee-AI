
import { GoogleGenAI, Chat, GenerativePart, Modality } from "@google/genai";
import type { LiveServerMessage, Operation, Video } from "@google/genai";
// Fix: Import `VoiceType` to use in `generateSpeech`.
import { AspectRatio, Character, VoiceMap, VoiceType } from "../types";
import { fileToGenerativePart } from "../utils/fileUtils";
import { decode, decodeAudioData, createPcmBlob } from "../utils/audioUtils";

const getAiClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY environment variable is not set.");
    }
    return new GoogleGenAI({ apiKey });
}

const buildCharacterPrompt = (prompt: string, character: Character): string => {
    return `Generate for a character named ${character.name}, who is a ${character.personality} ${character.role}. The desired style is ${character.style}. User prompt: ${prompt}`;
};

// === Image Generation (Imagen) ===
export const generateImage = async (prompt: string, aspectRatio: AspectRatio, character?: Character): Promise<string | null> => {
    const ai = getAiClient();
    const finalPrompt = character ? buildCharacterPrompt(prompt, character) : prompt;
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: finalPrompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: aspectRatio,
        },
    });
    const base64ImageBytes: string | undefined = response.generatedImages[0]?.image.imageBytes;
    return base64ImageBytes ? `data:image/jpeg;base64,${base64ImageBytes}` : null;
};

// === Image Editing (Gemini Flash Image) ===
export const editImage = async (prompt: string, imagePart: GenerativePart): Promise<string | null> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
    }
    return null;
};

// === Video Generation (Veo) ===
export const startVideoGeneration = async (prompt: string, imageFile: File | null, aspectRatio: AspectRatio, character?: Character): Promise<Operation> => {
    // Veo requires a new instance to ensure the latest API key from the selection dialog is used.
    const ai = getAiClient();
    const finalPrompt = character ? buildCharacterPrompt(prompt, character) : prompt;
    const imagePayload = imageFile ? {
        image: {
            imageBytes: (await fileToGenerativePart(imageFile)).inlineData.data,
            mimeType: (await fileToGenerativePart(imageFile)).inlineData.mimeType,
        }
    } : {};

    return ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: finalPrompt,
        ...imagePayload,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio === '9:16' ? '9:16' : '16:9'
        }
    });
};

export const extendVideoGeneration = async (prompt: string, previousOperation: Operation, character?: Character): Promise<Operation> => {
    // Veo requires a new instance to ensure the latest API key from the selection dialog is used.
    const ai = getAiClient();
    const finalPrompt = character ? buildCharacterPrompt(prompt, character) : prompt;
    const previousVideo = previousOperation.response?.generatedVideos?.[0]?.video as (Video & {aspectRatio?: '16:9' | '9:16'});

    if (!previousVideo) {
        throw new Error("Previous video not found in operation to extend.");
    }
    
    return ai.models.generateVideos({
        model: 'veo-3.1-generate-preview',
        prompt: finalPrompt,
        video: previousVideo, 
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: previousVideo.aspectRatio, // Use the same aspect ratio
        }
    });
};


export const checkVideoOperationStatus = async (operation: Operation): Promise<Operation> => {
    const ai = getAiClient();
    return ai.operations.getVideosOperation({ operation: operation });
};

export const fetchVideoFromUri = async (uri: string): Promise<string> => {
    const response = await fetch(`${uri}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
};

// === Chat (Gemini Flash & Pro) ===
export const startChat = (options: { model?: string; systemInstruction?: string; config?: any, character?: Character } = {}): Chat => {
    const ai = getAiClient();
    let systemInstruction = options.systemInstruction || 'You are a helpful and creative assistant.';
    if (options.character) {
        const char = options.character;
        systemInstruction = `You are playing the role of ${char.name}, a ${char.personality} ${char.role}. Your speech style should reflect this. The user is talking to you as this character. Keep your responses in character. Original system instruction: ${systemInstruction}`;
    }

    return ai.chats.create({
        model: options.model || 'gemini-2.5-flash',
        config: {
            systemInstruction,
            ...options.config,
        },
    });
};

// === Live Conversation & Transcription (Gemini Native Audio) ===
export type LiveSession = Awaited<ReturnType<typeof connectToLive>>;
export const connectToLive = async (
    stream: MediaStream, 
    onMessage: (message: LiveServerMessage) => void, 
    onError: (e: ErrorEvent) => void,
    onClose: (e: CloseEvent) => void,
    transcriptionOnly: boolean = false
) => {
    const ai = getAiClient();
    const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const outputAudioContext = transcriptionOnly ? null : new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    let nextStartTime = 0;
    const sources = new Set<AudioBufferSourceNode>();

    const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: () => {
                const source = inputAudioContext.createMediaStreamSource(stream);
                const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                    const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                    const pcmBlob = createPcmBlob(inputData);
                    sessionPromise.then((session) => {
                        session.sendRealtimeInput({ media: pcmBlob });
                    });
                };
                source.connect(scriptProcessor);
                scriptProcessor.connect(inputAudioContext.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
                onMessage(message);
                if (!outputAudioContext || transcriptionOnly) return;

                const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                if (base64EncodedAudioString) {
                    nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                    const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), outputAudioContext, 24000, 1);
                    const sourceNode = outputAudioContext.createBufferSource();
                    sourceNode.buffer = audioBuffer;
                    sourceNode.connect(outputAudioContext.destination);
                    sourceNode.addEventListener('ended', () => sources.delete(sourceNode));
                    sourceNode.start(nextStartTime);
                    nextStartTime += audioBuffer.duration;
                    sources.add(sourceNode);
                }
                if (message.serverContent?.interrupted) {
                    sources.forEach(source => source.stop());
                    sources.clear();
                    nextStartTime = 0;
                }
            },
            onerror: onError,
            onclose: onClose,
        },
        config: transcriptionOnly ? {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
        } : {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
        },
    });

    return {
      close: () => {
        sessionPromise.then(session => session.close());
        inputAudioContext.close();
        outputAudioContext?.close();
      }
    };
};

// === Video Analysis (Gemini Pro) ===
export const analyzeVideoFrames = async (frames: string[]): Promise<string> => {
    const ai = getAiClient();
    const imageParts: GenerativePart[] = frames.map(frame => ({
        inlineData: {
            mimeType: 'image/jpeg',
            data: frame,
        },
    }));
    const prompt = "Analyze these video frames in sequence. Describe what is happening in the video, identify key objects, and summarize the overall activity.";
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: { parts: [...imageParts, { text: prompt }] },
        config: {
            thinkingConfig: { thinkingBudget: 32768 }
        }
    });
    return response.text;
};

// === Text-to-Speech (Gemini TTS) ===
export const generateSpeech = async (text: string, audioContext: AudioContext, character?: Character): Promise<AudioBuffer | null> => {
    const ai = getAiClient();
    const voiceName = character ? VoiceMap[character.voice_type] : 'Kore';
    // Fix: Correctly compare against the `VoiceType` enum member instead of a string literal.
    const final_text = character && character.voice_type === VoiceType.Robotic ? `In a robotic voice, say: ${text}` : `Say: ${text}`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: final_text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
        },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
        return decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
    }
    return null;
};

// === Low-latency Prompt Generation (Gemini Flash Lite) ===
export const generatePromptInspiration = async (context: string): Promise<string> => {
    const ai = getAiClient();
    const prompt = `Generate a single, creative, and detailed prompt for generating ${context}. Be imaginative. Only return the prompt text itself, no extra words or quotes.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: prompt,
    });
    return response.text.trim().replace(/^"(.*)"$/, '$1'); // Remove surrounding quotes if any
};


// === Thinking Mode Story Generation (Gemini Pro) ===
export const generateStoryForImage = async (imagePart: GenerativePart): Promise<string> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: { parts: [imagePart, { text: "Write a detailed, imaginative short story based on this image. Explore the characters, setting, and what might be happening." }] },
        config: {
            thinkingConfig: { thinkingBudget: 32768 }
        }
    });
    return response.text;
};
