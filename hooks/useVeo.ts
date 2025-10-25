import { useState, useCallback, useRef } from 'react';
import { startVideoGeneration, checkVideoOperationStatus, fetchVideoFromUri, extendVideoGeneration } from '../services/geminiService';
import type { Operation } from '@google/genai';
import { AspectRatio, Character } from '../types';

export const useVeo = () => {
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastOperation, setLastOperation] = useState<Operation | null>(null);
    const pollingInterval = useRef<number | null>(null);

    const stopPolling = () => {
        if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
            pollingInterval.current = null;
        }
    };

    const reset = useCallback(() => {
        setVideoUrl(null);
        setIsLoading(false);
        setError(null);
        setLastOperation(null);
        stopPolling();
    }, []);

    const pollOperation = useCallback(async (operation: Operation) => {
        pollingInterval.current = window.setInterval(async () => {
            try {
                const updatedOperation = await checkVideoOperationStatus(operation);
                if (updatedOperation.done) {
                    stopPolling();
                    if (updatedOperation.response?.generatedVideos?.[0]?.video?.uri) {
                        const uri = updatedOperation.response.generatedVideos[0].video.uri;
                        const fetchedVideoUrl = await fetchVideoFromUri(uri);
                        setVideoUrl(fetchedVideoUrl);
                        setLastOperation(updatedOperation);
                    } else {
                        setError('Video generation finished, but no video was returned.');
                    }
                    setIsLoading(false);
                }
            } catch (err) {
                stopPolling();
                setIsLoading(false);
                setError('An error occurred while checking video status.');
                console.error(err);
            }
        }, 10000); // Poll every 10 seconds
    }, []);


    const generate = useCallback(async (prompt: string, imageFile: File | null, aspectRatio: AspectRatio, character?: Character) => {
        reset();
        setIsLoading(true);

        try {
            if (!window.aistudio) {
              throw new Error("AI Studio context is not available.");
            }
            
            let hasKey = await window.aistudio.hasSelectedApiKey();
            if (!hasKey) {
                await window.aistudio.openSelectKey();
                // Assume success after dialog opens to avoid race condition
                // A true check will happen with the API call itself.
            }
        
            const operation = await startVideoGeneration(prompt, imageFile, aspectRatio, character);
            await pollOperation(operation);

        } catch (err: any) {
            setIsLoading(false);
            let errorMessage = 'An error occurred during video generation.';
            if (err.message && err.message.includes("Requested entity was not found.")) {
                errorMessage = "API Key not found or invalid. Please select a valid API key.";
                // Optionally prompt to re-select key
                window.aistudio.openSelectKey();
            } else if (err.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
            console.error(err);
        }
    }, [reset, pollOperation]);

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
        
            const operation = await extendVideoGeneration(prompt, lastOperation, character);
            await pollOperation(operation);

        } catch (err: any) {
            setIsLoading(false);
            let errorMessage = 'An error occurred during video extension.';
            if (err.message && err.message.includes("Requested entity was not found.")) {
                errorMessage = "API Key not found or invalid. Please select a valid API key.";
                window.aistudio.openSelectKey();
            } else if (err.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
            console.error(err);
        }
    }, [lastOperation, pollOperation]);

    return { videoUrl, isLoading, error, generate, reset, extend };
};
