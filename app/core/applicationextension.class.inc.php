<?php

/**
 * @copyright   Copyright (C) 2019-2020 Jeffrey Bostoen
 * @license     See license.md
 * @version     2020-01-27 19:00:07
 *
 * Defines extensions for geometry tab.
 */
 
namespace jb_itop_extensions\geometry;

use \AttributeGeometry;
use \DBObjectSet;
use \DBProperty;
use \utils;
use \WebPage;

/**
* Class GeometryTabUIExtension_CrabAddress_Sample. Provides an example on how to add a custom locator bar.
* Requires jb-crab to function.
*/
abstract class GeometryTabUIExtension_CrabAddress_Sample implements iGeometryTabToolbarExtension {
	
	/**
	 * @var \Float $fRank. Rank. Lower = button comes first in geometry tab UI collection.
	 */
	public static $fRank = 1.0;
	
	/**
	 * @inheritDoc
	 *
	 * @details Originally written for iTop 2.7.0. In iTop 2.8, there seems to be a new autocomplete mechanism. Might need to be redefined here.
	 *
	 */
	public static function AddToolbarElement(?DBObjectSet $oSetObjects, DBObjectSet $oSetMaps, WebPage $oPage, ?AttributeGeometry $oAttDefGeometry, $sMapRenderingTriggeredBy, $sMapTargetId, $bEditMode = false) {

		// This will make sure this geolocator example only appears on a specific test database.
		// Unfortunately it can't be placed around the class definition or it crashes in setup.
		if(DBProperty::GetProperty('database_uuid', '') != '{D802826B-BB3F-1D1E-3A5D-86FA3CFCFCEF}' || class_exists('CrabAddress') == false) {
			return;
		}
	
		// ExtKeyWidget is NOT available in non-edit mode by default!
		if($bEditMode == false) {
			$oPage->add_linked_script('../js/wizardhelper.js');
			$oPage->add_linked_script('../js/wizard.utils.js');
			$oPage->add_linked_script('../js/extkeywidget.js');
			$oPage->add_linked_script('../js/forms-json-utils.js'); // OnAutoComplete() function
		}
		
		$sGeolocatorId = 'geolocator_crabaddress_id_'.$sMapTargetId;
		
		$oPage->add_linked_script(utils::GetCurrentModuleUrl().'/app/js/geometryhelper.ext.crablocator.js');
	
		$oPage->add_ready_script(
<<<JS
		InitCrabLocator('{$sGeolocatorId}', '{$sMapTargetId}');
JS
		);
		
		// GPS locator should not be visible if the map type is "image"
		$oPage->add_style(
<<<CSS
			[data-map-type='image'] .jb-tabcontrol-crablocator {
				display: none;
			}
CSS
		);
		
		return
<<<HTML
		<div class="jb-geometry-tabcontrol-container jb-tabcontrol-crablocator">
			| <input class="field_autocomplete" type="text" id="label_{$sGeolocatorId}" value=""/><input type="hidden" id="{$sGeolocatorId}" value=""/>
		</div>
HTML;
		
	}
	
}


