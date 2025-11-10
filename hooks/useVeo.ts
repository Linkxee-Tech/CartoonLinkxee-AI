
import { useState, useCallback } from 'react';
import { startVideoGeneration, checkVideoOperationStatus, fetchVideoFromUri, extendVideoGeneration } from '../services/geminiService';
import type { Operation } from '@google/genai';
import { AspectRatio, Character, VideoDuration } from '../types';
import { getFriendlyErrorMessage } from '../utils/errorHandler';

const waitForOperation = (operation: Operation): Promise<Operation> => {
    return new Promise((resolve, reject) => {
        const poller = async () => {
            try {
                const updatedOperation = await checkVideoOperationStatus(operation);
                if (updatedOperation.done) {
                    if (updatedOperation.response) {
                        resolve(updatedOperation);
                    } else {
                        reject(new Error("Operation finished but no response was returned."));
                    }
                } else {
                    setTimeout(poller, 10000); // Poll every 10 seconds
                }
            } catch (err) {
                reject(err);
            }
        };
        poller();
    });
};

const getExtensionCount = (duration: VideoDuration): number => {
    switch (duration) {
        case 'medium': return 3; // ~30s
        case 'long': return 8; // ~60s
        case 'two_minutes': return 16; // ~2 minutes
        case 'three_minutes': return 25; // ~3 minutes
        case 'four_minutes': return 33; // ~4 minutes
        case 'five_minutes': return 42; // ~5 minutes
        case 'ten_minutes': return 85; // ~10 minutes
        case 'fifteen_minutes': return 128; // ~15 minutes
        case 'twenty_minutes': return 170; // ~20 minutes
        case 'short':
        default:
            return 0; // ~10s
    }
};

export const useVeo = () => {
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progressMessage, setProgressMessage] = useState<string | null>(null);
    const [lastOperation, setLastOperation] = useState<Operation | null>(null);

    const reset = useCallback(() => {
        setVideoUrl(null);
        setIsLoading(false);
        setError(null);
        setLastOperation(null);
        setProgressMessage(null);
    }, []);

    const generate = useCallback(async (prompt: string, imageFile: File | null, aspectRatio: AspectRatio, duration: VideoDuration, character?: Character) => {
        reset();
        setIsLoading(true);

        try {
            if (!window.aistudio) {
              throw new Error("AI Studio context is not available.");
            }
            
            let hasKey = await window.aistudio.hasSelectedApiKey();
            if (!hasKey) {
                await window.aistudio.openSelectKey();
            }
        
            setProgressMessage('Generating initial clip...');
            let operation = await startVideoGeneration(prompt, imageFile, aspectRatio, character);
            let completedOperation = await waitForOperation(operation);
            setLastOperation(completedOperation);

            const extensionsNeeded = getExtensionCount(duration);
            for (let i = 0; i < extensionsNeeded; i++) {
                setProgressMessage(`Extending video (${i + 1}/${extensionsNeeded})...`);
                operation = await extendVideoGeneration(prompt, completedOperation, character);
                completedOperation = await waitForOperation(operation);
                setLastOperation(completedOperation);
            }

            setProgressMessage('Finalizing video...');
            if (completedOperation.response?.generatedVideos?.[0]?.video?.uri) {
                const uri = completedOperation.response.generatedVideos[0].video.uri;
                const fetchedVideoUrl = await fetchVideoFromUri(uri);
                setVideoUrl(fetchedVideoUrl);
            } else {
                setError('Video generation finished, but no video was returned.');
            }

        } catch (err: any) {
            console.error(err);
            if (err.message && err.message.includes("Requested entity was not found.")) {
                setError("API Key not found or invalid. Please select a valid API key.");
                if (window.aistudio?.openSelectKey) {
                    window.aistudio.openSelectKey();
                }
            } else {
                setError(getFriendlyErrorMessage(err));
            }
        } finally {
            setIsLoading(false);
            setProgressMessage(null);
        }
    }, [reset]);

    const extend = useCallback(async (prompt: string, character?: Character) => {
        if (!lastOperation) {
            setError("No previous video to extend. Please generate a video first.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setVideoUrl(null); // Clear old video to show loading

        try {
            if (!window.aistudio) {
              throw new Error("AI Studio context is not available.");
            }
            
            let hasKey = await window.aistudio.hasSelectedApiKey();
            if (!hasKey) {
                await window.aistudio.openSelectKey();
            }
        
            setProgressMessage('Extending video...');
            const operation = await extendVideoGeneration(prompt, lastOperation, character);
            const completedOperation = await waitForOperation(operation);

            if (completedOperation.response?.generatedVideos?.[0]?.video?.uri) {
                const uri = completedOperation.response.generatedVideos[0].video.uri;
                const fetchedVideoUrl = await fetchVideoFromUri(uri);
                setVideoUrl(fetchedVideoUrl);
                setLastOperation(completedOperation);
            } else {
                setError('Video extension finished, but no video was returned.');
            }

        } catch (err: any) {
            console.error(err);
            if (err.message && err.message.includes("Requested entity was not found.")) {
                setError("API Key not found or invalid. Please select a valid API key.");
                if (window.aistudio?.openSelectKey) {
                    window.aistudio.openSelectKey();
                }
            } else {
                setError(getFriendlyErrorMessage(err));
            }
        } finally {
            setIsLoading(false);
            setProgressMessage(null);
        }
    }, [lastOperation]);

    return { videoUrl, isLoading, error, generate, reset, extend, progressMessage };
};
