interface PromptParams {
    branch?: string;
    year?: string;
    semester?: number;
  }
  
  export const getPromptsForUser = ({
    branch = "{Branch}",
    year = "{Year}",
    semester,
  }: PromptParams): string[] => {
    const semDisplay = semester && semester > 0 ? semester : "{Semester No}";
  
    return [
      `Give classified list of subjects in ${branch} ${year} Semester ${semDisplay}.`,
      `Give me list of units in {Subject name} from ${branch} ${year} Semester ${semDisplay}.`,
      `How to prepare for Unit-{Unit number} of {Subject name} from ${branch} ${year} Semester ${semDisplay}?`,
      `How to perform Experiment-{Experiment number} of {Lab Name} Lab from ${branch} ${year} Semester ${semDisplay}?`,
      `Give classified list of topics in Unit-{Unit number} of {Subject name} from ${branch} ${year} Semester ${semDisplay}.`,
    ];
  };  
