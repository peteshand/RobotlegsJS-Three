// ------------------------------------------------------------------------------
//  Copyright (c) 2017-present, RobotlegsJS. All Rights Reserved.
//
//  NOTICE: You are permitted to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
// ------------------------------------------------------------------------------

import { Object3D } from 'three';

import { IClass } from "@robotlegsjs/core";

import { ContainerBinding } from "./ContainerBinding";

/**
 * @private
 */
export class StageCrawler {
    /*============================================================================*/
    /* Private Properties                                                         */
    /*============================================================================*/

    private _binding: ContainerBinding;

    /*============================================================================*/
    /* Constructor                                                                */
    /*============================================================================*/

    /**
     * @private
     */
    constructor(containerBinding: ContainerBinding) {
        this._binding = containerBinding;
    }

    /*============================================================================*/
    /* Public Functions                                                           */
    /*============================================================================*/

    /**
     * @private
     */
    public scan(container: typeof Object3D): void {
        this.scanContainer(container);
    }

    /*============================================================================*/
    /* Private Functions                                                          */
    /*============================================================================*/

    private scanContainer(container: typeof Object3D): void {
        this.processView(container);

        container.children.forEach(child => {
            if (child instanceof Object3D) {
                this.scanContainer(child);
            } else {
                this.processView(child);
            }
        });
    }

    private processView(view: typeof Object3D /*DisplayObject*/): void {
        this._binding.handleView(view, <IClass<any>>view.constructor);
    }
}
