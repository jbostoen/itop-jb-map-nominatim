<?php

/**
 * @copyright   Copyright (c) 2019-2023 Jeffrey Bostoen
 * @license     See license.md
 * @version     2.7.231023
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
* Class GeometryTabUIExtension_NominatimLocator. Providesf an example on how to add a custom locator bar.
*/
abstract class GeometryTabUIExtension_NominatimLocator implements iGeometryTabToolbarExtension {
	
	/**
	 * @var \Float $fRank. Rank. Lower = button comes first in geometry tab UI collection.
	 */
	public static $fRank = 1.0;
	
	/**
	 * @inheritDoc
	 *
	 */
	public static function AddToolbarElement(?DBObjectSet $oSetObjects, DBObjectSet $oSetMaps, WebPage $oPage, ?AttributeGeometry $oAttDefGeometry, $sMapRenderingTriggeredBy, $sMapTargetId, $bEditMode) {

		$sGeolocatorId = 'geolocator_nominatimlocator_id_'.$sMapTargetId;
		$sEditMode = ($bEditMode == true ? 'true': 'false');
		
		$oPage->add_linked_script(utils::GetCurrentModuleUrl().'/app/js/geometryhelper.ext.nominatim.js');
	
		$oPage->add_ready_script(
<<<JS
		InitNominatimLocator('{$sGeolocatorId}', '{$sMapTargetId}', {$sEditMode});
JS
		);
		
		// GPS locator should not be visible if the map type is "image"
		$oPage->add_style(
<<<CSS
			[data-map-type='image'] .jb-tabcontrol-nominatimlocator {
				display: none;
			}
CSS
		);
		
		return
<<<HTML
		<div class="jb-geometry-tabcontrol-container jb-tabcontrol-nominatimlocator">
			| <input class="field_autocomplete" type="text" id="{$sGeolocatorId}" value=""/>
		</div>
HTML;
		
	}
	
}


