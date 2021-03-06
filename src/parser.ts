import type { Vault } from 'obsidian';
import { PLAN_PARSER_REGEX } from './constants';
import { PlanItem, PlanSummaryData } from './plan-data';

export default class Parser {
    vault: Vault;

    constructor(vault: Vault) {
        this.vault = vault;
    }

    async parseMarkdown(fileContent: string[]): Promise<PlanSummaryData> {
        const parsed = this.parse(fileContent.join('\n'));
        const transformed = this.transform(parsed);
        return new PlanSummaryData(transformed);
    }

    private parse(input: string): RegExpExecArray[] {
        try {
            const matches = [];
            let match;
            while(match = PLAN_PARSER_REGEX.exec(input)){
              matches.push(match)
            }
            return matches;
        } catch (error) {
            console.log(error)
        }
    }

    private transform(regexMatches: RegExpExecArray[]): PlanItem[]{
        const results = regexMatches.map((value:RegExpExecArray, index) => {
            try {
                const isUnmatched = value.groups.unmatched !== undefined;
                if(isUnmatched) {
                    const unMatchedText = value[0];
                    return new PlanItem(index, value.index, false, false, false, true, undefined, undefined, unMatchedText, unMatchedText)
                }
                const isCompleted = this.matchValue(value.groups.completion, 'x');
                const isBreak = this.matchValue(value.groups.break, 'break');
                const isEnd = this.matchValue(value.groups.end, 'end');
                const time = new Date();
                time.setHours(parseInt(value.groups.hours))
                time.setMinutes(parseInt(value.groups.minutes))
                time.setSeconds(0);
                return new PlanItem(
                    index, 
                    value.index, 
                    isCompleted, 
                    isBreak,
                    isEnd,
                    false,
                    time, 
                    `${value.groups.hours.padStart(2, '0')}:${value.groups.minutes}`,
                    value.groups.text?.trim(),
                    value[0]
                );
            } catch (error) {
                console.log(error);
            }
        });
        return results;
    }

    private matchValue(input: any, match: string): boolean {
        return input?.trim().toLocaleLowerCase() === match;
    }

}
