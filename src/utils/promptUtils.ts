export const getPromptsForUser = ({
    branch,
    year,
    semester,
}: {
    branch?: string;
    year?: string;
    semester?: number;
}) => {
    if (!semester || semester == 0) {
        return [
            `Give classified List of Subjects in {Branch} {Year} Semester {Semester No}.`,
            `Give me list of units in {Subject name} from {Branch} {Year} Semester {Semester No}.`,
            `How to prepare for Unit-{Unit number} of {Subject name} from {Branch} {Year} Semester {Semester No}?`,
            `How to perform Experiment-{Experiment number} of {Lab Name} Lab from {Branch} {Year} Semester {Semester No}?`,
            `Give classified list of topics of Unit-{Unit number} of {Subject name} from {Branch} {Year} Semester {Semester No}.`
        ];
    }

    return [
        `Give classified List of Subjects in ${branch} ${year} Semester ${semester}.`,
        `Give me list of units in {Subject name} from ${branch} ${year} Semester ${semester}.`,
        `How to prepare for Unit-{Unit number} of {Subject name} from ${branch} ${year} Semester ${semester}?`,
        `How to perform Experiment-{Experiment number} of {Lab Name} Lab from ${branch} ${year} Semester ${semester}?`,
        `Give classified list of topics of Unit-{Unit number} of {Subject name} from ${branch} ${year} Semester ${semester}.`
    ];
};
