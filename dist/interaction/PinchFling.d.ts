type ScrollFlingOptions = Partial<Pick<PinchFling, 'target' | 'x' | 'minX' | 'maxX' | 'factor'>>;
export declare class PinchFling {
    #private;
    /**
     * During pinch, this value will change. It is a signal so that it can be
     * observed. Set this value initially if you want to start at a certain
     * value.
     */
    x: number;
    minX: number;
    maxX: number;
    target: Document | ShadowRoot | Element;
    factor: number;
    get interacting(): boolean;
    get isStarted(): boolean;
    constructor(options: ScrollFlingOptions);
    start(): this;
    stop(): this;
}
export {};
//# sourceMappingURL=PinchFling.d.ts.map