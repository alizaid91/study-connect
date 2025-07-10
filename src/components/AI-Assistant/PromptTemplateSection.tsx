import { motion, AnimatePresence } from 'framer-motion';
import { getPromptsForUser } from '../../utils/promptUtils';
import { RootState } from '../../store/index';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

interface PromptTemplateSectionProps {
    isTyping: boolean;
    onSelectPrompt: (prompt: string) => void;
}

export default function PromptTemplateSection({ isTyping, onSelectPrompt }: PromptTemplateSectionProps) {
    const { profile } = useSelector((state: RootState) => state.auth);
    const { loadingAi } = useSelector((state: RootState) => state.chat);
    const [prompts, setPrompts] = useState<string[]>([]);

    useEffect(() => {
        if (profile && profile.role) {
            const userPrompts = getPromptsForUser({
                branch: profile?.branch,
                year: profile?.year,
                semester: profile?.semester,
            });
            setPrompts(userPrompts);
        }
    }, [profile])

    const shouldShow = isTyping;

    return (
        <AnimatePresence>
            {prompts.length && shouldShow && !loadingAi && (
                <div className="sm:mx-2 mt-4 mb-2 relative">
                    {/* <div className="pointer-events-none absolute -left-4 top-0 border border-red-500 h-full w-8 bg-gradient-to-r from-gray-50 via-white/70 to-transparent z-10" /> */}

                    {/* Right Gradient */}
                    {/* <div className="pointer-events-none absolute -right-4 top-0 h-full w-8 border border-red-500 bg-gradient-to-l from-gray-50 via-white/70 to-transparent z-10" /> */}

                    <div className=' no-scrollbar h-full w-full flex flex-nowrap overflow-x-auto gap-3 z-50'>
                        {prompts.map((prompt, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    onSelectPrompt(prompt);
                                }}
                                className="flex-shrink-0 max-w-full px-4 py-1.5 text-sm rounded-3xl bg-gray-300 text-black font-semibold transition"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}