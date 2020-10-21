

	/**
	 * Initiates a Crab address Locator in the toolbar
	 *
	 * @param {string} sGeolocatorId Name of the geolocator instance
	 * @param {string} sMapTargetId Name of target HTML element
	 * @return {void}
	 */
	function InitCrabLocator(sGeolocatorId, sMapTargetId) {
		

		// Copy oWizardHelper from CrabAddress details.
		// A WizardHelper seems needed; but DO NOT use SetFieldsMap() or SetFieldsCount().
		window['oWizardHelper_' + sGeolocatorId] = new WizardHelper('CrabAddress', '', '');
		
		// iTop 2.7.0: ExtKeyWidget(id, sTargetClass, sFilter, sTitle, bSelectMode, oWizHelper, sAttCode, bSearchMode, bDoSearch) 
		window['oACWidget_' + sGeolocatorId] = new ExtKeyWidget(sGeolocatorId, 'CrabAddress', 'SELECT CrabAddress FROM CrabAddress AS CrabAddress', 'CrabAddress', false, window['oWizardHelper_' + sGeolocatorId], 'fake_att_geolocator', false, true);
		
		// oACWidget_{GeolocatorId}.emptyHtml = "<div style=\"background: #fff; border:0; text-align:center; vertical-align:middle;\"><p>Use the search form above to search for objects to be added.</p></div>";
		$('#label_' + sGeolocatorId).autocomplete(GetAbsoluteUrlAppRoot()+'pages/ajax.render.php', { 
			scroll:true, 
			minChars:2, 
			autoFill:false, 
			matchContains:true, 
			mustMatch: true, 
			keyHolder: '#' + sGeolocatorId, 
			extraParams: { 
				operation: 'ac_extkey', 
				sTargetClass: 'CrabAddress',
				sFilter: 'SELECT `CrabAddress` FROM CrabAddress',
				bSearchMode: false, 
				json: function() { 
					return window['oWizardHelper_' + sGeolocatorId].UpdateWizardToJSON(); 
				}
			}
		});
		
		$('#label_' + sGeolocatorId).keyup(function() { 
			if ($(this).val() == '') {
				// Useful for search forms: empty value in the "label", means no value, immediately!
				$('#' + sGeolocatorId).val(''); 
			}
		}); 
		
		$('#label_' + sGeolocatorId).result(function(event, data, formatted) { 
			OnAutoComplete(sGeolocatorId, event, data, formatted); 
		});
		
		$('#' + sGeolocatorId).bind('update', function() { 
			window['oACWidget_' + sGeolocatorId].Update();
		});

		if ($('#ac_dlg_' + sGeolocatorId).length == 0) {
			$('body').append('<div id="ac_dlg_' + sGeolocatorId + '"></div>');
		}
		
		if ($('#ajax_' + sGeolocatorId).length == 0) {
			$('body').append('<div id="ajax_' + sGeolocatorId + '"></div>');
		}
		
		$('#' + sGeolocatorId).bind('validate change', function(evt, sFormId) {
			
			// @todo combodo-dev / last checked iTop 2.7 / In some iTop versions, this seems to be $$NULL$$ instead of anything real
			if($('#' + sGeolocatorId).val() != '' && $('#' + sGeolocatorId).val() != '$$NULL$$') {
				$.get(GetAbsoluteUrlAppRoot() + 'env-production/jb-framework/ajax/JSON.php', {
					oql: 'SELECT CrabAddress WHERE id = ' + parseInt($('#' + sGeolocatorId).val(), ''),
					options: {
						attributes: ['geom']
					}
				}, 
				function(data) {
					// Expecting a single result
					console.log('Crab locator: found ' + data.length + ' results');
					if(data.length == 1) {
						var geom = data[0].geom;
						if(geom != '') {
							// Geometry field is not empty. Assuming WKT coordinates, in this case in EPSG:3857
							// Skip checks whether oGeometryHelper.lastCreatedMap is defined. This method is only called if it is.
							var oFeature = oGeometryHelper.format.WKT.readFeature(geom);
							
							if(oGeometryHelper.maps[sMapTargetId] !== null) {
								oGeometryHelper.maps[sMapTargetId].getView().setCenter(oFeature.getGeometry().getCoordinates());
							}
						}
					}
				});
			}
			
		});
	
	}
	