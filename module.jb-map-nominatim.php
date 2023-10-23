<?php

/**
 * @copyright   Copyright (c) 2019-2023 Jeffrey Bostoen
 * @license     See license.md
 * @version     2.7.231023
 *
 * iTop module definition file
 */

SetupWebPage::AddModule(
	__FILE__, // Path to the current file, all other file names are relative to the directory containing this file
	'jb-map-nominatim/2.7.231023',
	array(
		// Identification
		//
		'label' => 'jb-map-nominatim',
		'category' => 'business',

		// Setup
		//
		'dependencies' => array(
			'itop-config-mgmt/2.6.0',
			'itop-request-mgmt-itil/2.6.0',
			'jb-framework/2.6.0',
			'jb-map-main/2.7.231023',
		),
		'mandatory' => false,
		'visible' => true,

		// Components
		//
		'datamodel' => array(
			'model.jb-map-nominatim.php',
			'app/core/applicationextension.class.inc.php',
		),
		'webservice' => array(
			
		),
		'data.struct' => array(
			// add your 'structure' definition XML files here,
		),
		'data.sample' => array(
			// add your sample data XML files here,
		),
		
		// Documentation
		//
		'doc.manual_setup' => '', // hyperlink to manual setup documentation, if any
		'doc.more_information' => '', // hyperlink to more information, if any 

		// Default settings
		//
		'settings' => array(
			// Module specific settings go here, if any
		),
	)
);









