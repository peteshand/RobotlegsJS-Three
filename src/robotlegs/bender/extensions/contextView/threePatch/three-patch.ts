// ------------------------------------------------------------------------------
//  Copyright (c) 2017-present, RobotlegsJS. All Rights Reserved.
//
//  NOTICE: You are permitted to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
// ------------------------------------------------------------------------------

import * as THREE from 'three';

export function applyThreePatch(scene: THREE.Scene) {
    addDispatchSceneEvent(scene);
    injectExtraAddCode();
    injectExtraRemoveCode();
}

function addDispatchSceneEvent(scene: THREE.Scene)
{
    THREE.Object3D.prototype.dispatchSceneEvent = function(object:any, event:any) {
        if (object == scene) {
            object.dispatchEvent(event);
        } else if (object.parent != null) {
            object.parent.dispatchSceneEvent(object.parent, event);
        }
    };
}

function injectExtraAddCode()
{
    var add = THREE.Object3D.prototype.add;
    var addStr:String = add.toString();
    addStr = addStr.split("object.dispatchEvent( { type: 'added' } );")
        .join("object.dispatchEvent( { type: 'added' } );\n\t\t\tobject.dispatchSceneEvent(object, { type: 'add_child', child:object } );");
    add = eval("var f = function(){ return " + addStr + ";}; f() ;");
    THREE.Object3D.prototype.add = add;
}

function injectExtraRemoveCode()
{
    var remove = THREE.Object3D.prototype.remove;
    var removeStr:String = remove.toString();
    removeStr = removeStr.split("object.dispatchEvent( _removedEvent );")
        .join("object.dispatchEvent( _removedEvent );\n\t\t\tobject.dispatchSceneEvent(object, { type: 'remove_child', child:object } );");
    remove = eval("var f = function(){ return " + removeStr + ";}; f() ;");
    THREE.Object3D.prototype.remove= remove;
}