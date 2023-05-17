import { Observable, ObservableSubject, MaybePromise } from "@ulthar/typey";

type ObservableDependencyMap<TokenTypeMap> = {
    [K in keyof TokenTypeMap]: ObservableSubject<TokenTypeMap[K]>;
};

export type DependencyMapResolvers<TokenTypeMap> = {
    [K in keyof TokenTypeMap]: () => MaybePromise<TokenTypeMap[K]>;
};

export class Container<TokenTypeMap extends Record<string, unknown>> {
    dependencies = {} as ObservableDependencyMap<TokenTypeMap>;

    resolve<K extends keyof TokenTypeMap>(token: K): TokenTypeMap[K] {
        if (!this.dependencies[token] || !this.dependencies[token].current) {
            throw new Error(
                `Dependency with token ${token.toString()} is not registered.`
            );
        }
        return this.dependencies[token].current as TokenTypeMap[K];
    }

    register<K extends keyof TokenTypeMap>(token: K, value: TokenTypeMap[K]) {
        this.getDependencyObservable(token).update(value);
    }

    async registerAll(resolvers: DependencyMapResolvers<TokenTypeMap>) {
        for (const key in resolvers) {
            const resolver = resolvers[key];
            if (resolver) this.register(key, await resolver());
        }
    }

    lazilyResolve<K extends keyof TokenTypeMap>(
        token: K
    ): Observable<TokenTypeMap[K]> {
        return this.getDependencyObservable(token);
    }

    clear() {
        this.dependencies = {} as ObservableDependencyMap<TokenTypeMap>;
    }

    private getDependencyObservable<K extends keyof TokenTypeMap>(
        key: K
    ): ObservableSubject<TokenTypeMap[K]> {
        if (!this.dependencies[key]) {
            this.dependencies[key] = new ObservableSubject();
        }
        return this.dependencies[key];
    }

    getPlainDependencyMap(): TokenTypeMap {
        const map = {} as Record<string, unknown>;
        for (const key in this.dependencies) {
            map[key] = this.dependencies[key].current;
        }
        return map as TokenTypeMap;
    }
}
