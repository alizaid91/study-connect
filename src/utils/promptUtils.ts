interface PromptParams {
  branch?: string;
  pattern?: number | undefined;
  year?: string;
  semester?: number;
}

export const getPromptsForUser = ({
  branch = "{Branch}",
  pattern,
  year = "{Year}",
  semester,
}: PromptParams): string[] => {
  const semDisplay = semester && semester > 0 ? semester : "{Semester No}";
  const patternDisplay = pattern ? `${pattern} Pattern` : "";

  return [
    `Give classified list of subjects in ${branch} ${patternDisplay} ${year} Semester ${semDisplay}.`,
    `Give me list of units of {Subject name} in ${branch}.`,
    `Give classified list of topics in Unit-{Unit number} of {Subject Name} in ${branch}.`,
    `How to prepare Unit-{Unit number} of {Subject name} in ${branch}?`,
    `How to perform Experiment-{Experiment number} of {Lab Name} Lab in ${branch}?`,
  ];
};
