import express from 'express';

export abstract class CommonRoutesConfig {
    protected readonly app: express.Application;
    protected readonly name: string;

    constructor(app: express.Application, name: string) {
        this.app = app;
        this.name = name;
    }

    public getName() {
        return this.name;
    }

    public abstract configureRoutes(): express.Application;
}