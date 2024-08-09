

	var oXHRNominatim = null;
	var sLastNominatimAddress = '';

	/**
	 * Initiates an address locator in the toolbar.
	 *
	 * @param {string} sGeolocatorId Name of the geolocator instance.
	 * @param {string} sMapTargetId Name of target HTML element.
	 * @param {boolean} bEditMode Whether or not the object layer is in edit mode.
	 * @return {void}
	 */
	function InitNominatimLocator(sGeolocatorId, sMapTargetId, bEditMode) {

		// When changes are detected: do a look-up
		$(document.body).on('keyup change blur input', '#' + sGeolocatorId, function(e) {
			
			let sAddress = $(this).val();
			
			// Some of the above events are triggered simultaneously.
			if(sAddress === sLastNominatimAddress) {
				return;
			}
			
			oGeometryHelper.traceLog('Nominatim: Queue look up ' + sAddress);
			sLastNominatimAddress = sAddress;
			
			// Cancel (client-side) any already on-going search.
			if(oXHRNominatim !== null && sAddress != sLastNominatimAddress) {
				oXHRNominatim.abort();
			}
				
			setTimeout(function(sAddress) {

				let sUrl = 'https://nominatim.openstreetmap.org/search.php?&polygon_geojson=1&format=jsonv2&q=' + sAddress;

				// Still most request request and not an earlier one.
				if(sAddress != sLastNominatimAddress) {
					oGeometryHelper.traceLog('Nominatim: Skip request for ' + sAddress + ' / Last address: ' + sLastNominatimAddress);
					return;
				}
				
				oGeometryHelper.traceLog('Nominatim: Request ' + sAddress);
				
				oXHRNominatim = $.ajax({type: 'GET', url: sUrl, success: function(data) {
					
					// Safety precaution: make sure the map exists.
					if(oGeometryHelper.maps[sMapTargetId] !== null) {
								
						// There must be at least one result
						if(data.length > 0) {

							// For simplicity, work with this first result.
							let oResult = data[0];
							
							
							// It's inpredictable how accurate the result will be.
							// This is the geometry of the actually returned result.
							let oReturnedGeometry = oGeometryHelper.format.GeoJSON.readGeometry(oResult.geojson);
							
							// By default coordinates will be returned into EPSG:4326.
							// This may need to be converted to the map CRS.
							// By doing it early on, it avoids another conversion for the center point feature.
							let sCRS = $('[data-map-target-id="' + sMapTargetId + '"]').attr('data-attribute-crs');
							oReturnedGeometry.transform('EPSG:4326', sCRS);
							
							switch(oReturnedGeometry.getType()) {
								
								// Make sure to only get XY coordinates and nothing like POINT M
									
								case 'Point':
									oCenterPoint = new ol.geom.Point(ol.extent.getCenter(oReturnedGeometry.getExtent()));
									oGeometryHelper.traceLog('Nominatim: Point.');
									break;
									
								case 'LineString':
									oCenterPoint = new ol.geom.Point(ol.extent.getCenter(oReturnedGeometry.getExtent()));
									oGeometryHelper.traceLog('Nominatim: LineString > derived point.');
									break;
									
								case 'Polygon':
									oCenterPoint = oReturnedGeometry.getInteriorPoint();
									oCenterPoint = new ol.geom.Point(ol.extent.getCenter(oCenterPoint.getExtent()));
									oGeometryHelper.traceLog('Nominatim: Polygon > derived point.');
									break;
									
								default:
									// Likely MultiPoint, MultiLineString, MultiPolygon?
									oGeometryHelper.traceLog('Nominatim: Unsupported geometry type: ' + oGeometry.getType());
									return;
									
							}
							
							let oView = oGeometryHelper.maps[sMapTargetId].getView();
							
							// For any type of map: center.
							oView.setCenter(oCenterPoint.getCoordinates());
							
							// If the map 'detail' exists, the user is currently at least viewing a single object.
							if(typeof oGeometryHelper.maps.detail !== 'undefined') {
								
								// Actually editing?
								if(bEditMode == true) {
									
									// When editing an object, also zoom to this point.
									oView.setZoom(17);
								
									// If it's an allowed geometry type:
									// Create or replace existing feature.
									let oAttDef = oGeometryHelper.editableLayers.detail.getSource().get('itop').attributeDefinition;
									
									// Be even more strict than just rely on the allowed types.
									let oSetGeometry = null;
									
									if(oReturnedGeometry.getType() == $('#oGeometry_FeatureTypePicker_detail').val()) {
										oSetGeometry = oReturnedGeometry;
									}
									// Fallback.
									if(oSetGeometry == null &&  $('#oGeometry_FeatureTypePicker_detail').val() == 'Point') {
										oSetGeometry = oCenterPoint;
									}

									if(oSetGeometry !== null) {
									
										let oSource = oGeometryHelper.editableLayers['detail'].getSource();
										
										if(oSource.getFeatures().length == 1) {
											oSource.getFeatures()[0].setGeometry(oSetGeometry);
										}
										else {
											oSource.addFeature(new ol.Feature(oSetGeometry));
										}
										
										// Just in case (not sure whether there is a 'drawend' triggered, likely not this way):
										// Update the coordinates of the geometry field already.
										$('textarea[name="attr_' + oAttDef.attCode + '"]').val(oGeometryHelper.format[oAttDef.format].writeGeometry(oSetGeometry));
										
									}
								
								}
								
							}
								
						}
						else {
							
							oGeometryHelper.traceLog('Nominatim: No results.');
							
						}
					
					}
					
				}, dataType: 'json'});

			}, 1000, sAddress);

		});
	
	}
	