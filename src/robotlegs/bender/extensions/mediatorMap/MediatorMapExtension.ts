// ------------------------------------------------------------------------------
//  Copyright (c) 2017-present, RobotlegsJS. All Rights Reserved.
//
//  NOTICE: You are permitted to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
// ------------------------------------------------------------------------------

import { instanceOfType, IContext, IExtension, IInjector } from "@robotlegsjs/core";
import * as THREE from 'three';
import { IMediatorMap } from "./api/IMediatorMap";
import { MediatorMap } from "./impl/MediatorMap";

import { IViewManager } from "../viewManager/api/IViewManager";
import { IContextView } from "../contextView/api/IContextView";
import { ContextView } from "../contextView/impl/ContextView";

/**
 * This extension installs a shared IMediatorMap into the context
 */
export class MediatorMapExtension implements IExtension {
    /*============================================================================*/
    /* Private Properties                                                         */
    /*============================================================================*/

    private _injector: IInjector;

    private _mediatorMap: MediatorMap;

    private _viewManager: IViewManager;

    private context: IContext;
    private _scene: THREE.Scene;
    /*============================================================================*/
    /* Public Functions                                                           */
    /*============================================================================*/

    /**
     * @inheritDoc
     */
    public extend(context: IContext): void {
        this.context = context;
        context
            .beforeInitializing(this.beforeInitializing.bind(this))
            .beforeDestroying(this.beforeDestroying.bind(this))
            .whenDestroying(this.whenDestroying.bind(this));
        this._injector = context.injector;
        this._injector
            .bind(IMediatorMap)
            .to(MediatorMap)
            .inSingletonScope();
        
        
        this.context.addConfigHandler(instanceOfType(ContextView), this.handleContextView.bind(this));
    }

    private handleContextView(contextView: IContextView): void {
        this._scene = contextView.view;
    }

    private onSceneAdded(event:any):void {
        this._mediatorMap = this._injector.get<MediatorMap>(IMediatorMap);
        if (event.child instanceof THREE.Scene || event.child instanceof THREE.Object3D) {
			this._mediatorMap.mediate(event.child);
		} else
            throw new Error("Not sure what to do with this view type: " + event.child);
         
	}

	private onSceneRemoved(event:any):void {
        this._mediatorMap.unmediate(event.child);
	}
    
    /*============================================================================*/
    /* Private Functions                                                          */
    /*============================================================================*/

    private beforeInitializing(): void {
        this._mediatorMap = this._injector.get<MediatorMap>(IMediatorMap);
        
        if (this._injector.isBound(IViewManager)) {
            this._viewManager = this._injector.get<IViewManager>(IViewManager);
            this._viewManager.addViewHandler(this._mediatorMap);
        }
        
        this._scene.addEventListener("add_child", this.onSceneAdded.bind(this));
		this._scene.addEventListener("remove_child", this.onSceneRemoved.bind(this));
    }

    private beforeDestroying(): void {
        this._mediatorMap.unmediateAll();

        if (this._injector.isBound(IViewManager)) {
            this._viewManager = this._injector.get<IViewManager>(IViewManager);
            this._viewManager.removeViewHandler(this._mediatorMap);
        }
    }

    private whenDestroying(): void {
        if (this._injector.isBound(IMediatorMap)) {
            this._injector.unbind(IMediatorMap);
        }
    }
}
