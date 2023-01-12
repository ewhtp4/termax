import { SpinnerConfig } from "../spinner/spinner-config.js";
export type ExecuteConfig = {
    cmd: string;
    args: string[];
    handleErrors: boolean;
    spinner?: Partial<SpinnerConfig>;
    callback?: Function;
};
export declare const ExecuteConfigFactory: (config: Partial<ExecuteConfig>) => ExecuteConfig;
