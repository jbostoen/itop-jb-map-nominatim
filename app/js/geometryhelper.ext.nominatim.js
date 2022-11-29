

	var oXHRNominatim = null;
	var sLastNominatimAddress = '';

	/**
	 * Initiates an address locator in the toolbar.
	 *
	 * @param {string} sGeolocatorId Name of the geolocator instance
	 * @param {string} sMapTargetId Name of target HTML element
	 * @return {void}
	 */
	function InitNominatimLocator(sGeolocatorId, sMapTargetId) {

		// When changes are detected: do a look-up
		$(document.body).on('keyup change blur input', '#' + sGeolocatorId, function(e) {
			
			let sAddress = $(this).val();
			
			// Some of the above events are triggered simultaneously.
			if(sAddress === sLastNominatimAddress) {
				return;
			}
			
			console.log('Nominatim: Queue look up ' + sAddress);
			sLastNominatimAddress = sAddress;
			
			// Cancel (client-side) any already on-going search.
			if(oXHRNominatim !== null && sAddress != sLastNominatimAddress) {
				oXHRNominatim.abort();
			}
				
			setTimeout(function(sAddress) {

				let sUrl = 'https://nominatim.openstreetmap.org/search.php?&polygon_geojson=1&format=jsonv2&q=' + sAddress;

				// Still most request request and not an earlier one
				if(sAddress != sLastNominatimAddress) {
					console.log('Nominatim: Skip request for ' + sAddress + ' / Last address: ' + sLastNominatimAddress);
					return;
				}
				
				console.log('Nominatim: Request ' + sAddress);
				
				oXHRNominatim = $.ajax({type: 'GET', url: sUrl, success: function(data) {
					
					// Safety precaution: make sure the layer exists
					if(oGeometryHelper.maps[sMapTargetId] !== null) {
								
						// There must be at least one result
						if(data.length > 0) {

							// For simplicity, work with this first result.
							let oResult = data[0];
							
							// By defualt coordinates will be returned into EPSG:4326.
							// This may need to be converted.
							let sCRS = $('[data-map-target-id="' + sMapTargetId + '"]').attr('data-attribute-crs');
							
							// It's inpredictable how accurate the result will be.
							let oGeometry = oGeometryHelper.format.GeoJSON.readGeometry(oResult.geojson);
							
							switch(oGeometry.getType()) {
								
								case 'Point':
									break;
									
								case 'LineString':
									oGeometry = new ol.geom.Point(ol.extent.getCenter(oGeometry.getExtent()));
									break;
									
								case 'Polygon':
									oGeometry = oGeometry.getInteriorPoint();
									break;
									
								default:
									// Likely MultiPoint, MultiLineString, MultiPolygon?
									console.log('Nominatim: unsupported type: ' + oGeometry.getType());
									return;
									break;
									
							}
							
							oGeometry.transform('EPSG:4326', sCRS);
							
							let oSource = oGeometryHelper.editableLayers['detail'].getSource();
							
							if(oSource.getFeatures().length == 1) {
								oSource.getFeatures()[0].setGeometry(oGeometry);
							}
							else {
								oSource.addFeature(new ol.Feature(oGeometry));
							}
							
							// Center and zoom
							let oView = oGeometryHelper.maps[sMapTargetId].getView();
							oView.setCenter(oGeometry.getCoordinates());
							oView.setZoom(17);
							
							// Just in case (not sure whether there is a 'drawend' triggered, likely not this way):
							// Save in geometry field already (both edit and non-edit; although non-edit is currently not supposed to be visible)
							let oMapContainer = $('[data-map-target-id="' + sMapTargetId + '"]')[0];
							let sFormat = $(oMapContainer).attr('data-attribute-format');
							let sAttCode = $(oMapContainer).attr('data-attribute-code');
							$('textarea[name="attr_' + sAttCode + '"]').val(oGeometryHelper.format[sFormat].writeGeometry(oGeometry));
							
						}
						else {
							
							console.log('Nominatim: No results.');
							
						}
					
					}
					
				}, dataType: 'json'});

			}, 1000, sAddress);

		});
	
	}
	