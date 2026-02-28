export interface Member {
    name: string;
    role: string;
    charter?: string;
    status?: string;
    notes?: string;
    section: 'coordinator' | 'members' | 'codingAgent';
}
export interface TeamState {
    coordinator: Member | null;
    members: Member[];
    codingAgent: Member | null;
    filePath: string;
    lastModified: number;
    projectContext?: {
        description?: string;
        techStack?: string;
        user?: string;
    };
}
export declare function loadTeamState(squadDir: string): Promise<TeamState | null>;
export declare function getTeamState(): TeamState | null;
export declare function updateTeamState(newState: TeamState): Promise<void>;
export declare function scaffoldAgentDir(squadDir: string, agentName: string, role: string): void;
//# sourceMappingURL=teamState.d.ts.map