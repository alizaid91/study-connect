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
    })

    const shouldShow = isTyping;

    return (
        <AnimatePresence>
            {prompts.length && shouldShow && !loadingAi && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="p-2 sm:p-4 border border-gray-300 rounded-3xl mb-4 shadow-sm"
                >
                    <div className="flex flex-nowrap overflow-x-auto gap-3 px-2">
                        {prompts.map((prompt, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                        onSelectPrompt(prompt);
                                }}
                                className="flex-shrink-0 max-w-fit px-4 py-1.5 text-sm rounded-3xl bg-gray-300/60 text-black font-semibold transition"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}