export interface IToken {
    generatingTokens(userId: string, role:string): {
        accessToken: string;
        refreshToken: string;
    };
}
