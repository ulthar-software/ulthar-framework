import {
    BoundaryHandler,
    Entity,
    Interactor,
    Method,
    Model,
    Module,
    Permission,
    PresenterComponent,
    PresenterView,
    Provider,
    Role,
    Test,
    Type,
} from "../entities/editor/index.js";
import { LocalPackage } from "../entities/packages/local-package.js";

export interface ILanguageService {
    createType(name: string, pkg: LocalPackage): Promise<Type>;
    createModel(name: string, pkg: LocalPackage): Promise<Model>;
    createEntity(name: string, pkg: LocalPackage): Promise<Entity>;
    createModule(name: string, pkg: LocalPackage): Promise<Module>;

    createTest(name: string, pkg: LocalPackage): Promise<Test>;

    createInteractor(name: string, pkg: LocalPackage): Promise<Interactor>;

    createProvider(name: string, pkg: LocalPackage): Promise<Provider>;

    createError(name: string, pkg: LocalPackage): Promise<Error>;

    createRole(name: string, pkg: LocalPackage): Promise<Role>;
    createPermission(name: string, pkg: LocalPackage): Promise<Permission>;

    createBoundaryHandler(
        name: string,
        pkg: LocalPackage
    ): Promise<BoundaryHandler>;
    createPresenterComponent(
        name: string,
        pkg: LocalPackage
    ): Promise<PresenterComponent>;
    createPresenterView(
        name: string,
        pkg: LocalPackage
    ): Promise<PresenterView>;

    AddMethod(target: Entity | Provider, name: string): Promise<Method>;
}
