import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin, Clock, Phone, Navigation, Sparkles, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';

export default function SweetHavenLocation() {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);

  // Store Configuration
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const storeLat = parseFloat(import.meta.env.VITE_STORE_LAT || '13.0827');
  const storeLng = parseFloat(import.meta.env.VITE_STORE_LNG || '80.2707');
  const storeAddress = import.meta.env.VITE_STORE_ADDRESS || '45 Royal Confectionery Boulevard, Heritage Arcade, Chennai - 600001';
  const storePhone = import.meta.env.VITE_STORE_PHONE || '+91 98765 43210';
  const storeHours = import.meta.env.VITE_STORE_HOURS || 'Mon - Sun: 9:00 AM - 10:00 PM';

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${storeLat},${storeLng}`;

  useEffect(() => {
    if (!apiKey) {
      setMapError('No API key specified in VITE_GOOGLE_MAPS_API_KEY');
      return;
    }

    const loader = new Loader({
      apiKey: apiKey,
      version: 'weekly',
      libraries: ['places']
    });

    loader.load().then((google) => {
      if (!mapRef.current) return;

      const storeLocation = { lat: storeLat, lng: storeLng };

      const map = new google.maps.Map(mapRef.current, {
        center: storeLocation,
        zoom: 16,
        mapTypeId: 'roadmap',
        styles: [
          {
            "featureType": "poi.business",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#58111a" }]
          },
          {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{ "color": "#e9e5dc" }]
          }
        ]
      });

      const marker = new google.maps.Marker({
        position: storeLocation,
        map: map,
        title: 'Sweet Haven Flagship Bakery Studio',
        animation: google.maps.Animation.DROP
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; font-family: 'Playfair Display', serif; color: #3A1B1F;">
            <h4 style="margin: 0 0 4px 0; color: #58111a; font-weight: 700; font-size: 1.1rem;">Sweet Haven Flagship</h4>
            <p style="margin: 0 0 6px 0; font-size: 0.85rem; color: #666;">Artisan Confectionery & Cake Studio</p>
            <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="color: #d4af37; font-weight: 600; font-size: 0.85rem; text-decoration: none;">Get Directions &rarr;</a>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      setMapLoaded(true);
    }).catch((err) => {
      console.warn('Google Maps API load error:', err);
      setMapError('Failed to load Google Maps script');
    });
  }, [apiKey, storeLat, storeLng]);

  return (
    <section style={{ padding: '4rem 0', backgroundColor: 'var(--cream-light)', borderTop: '1px solid var(--border-color)' }}>
      <div className="container">
        
        {/* Section Title */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1.2rem',
            backgroundColor: 'rgba(212, 175, 55, 0.15)',
            border: '1px solid var(--gold-primary)',
            borderRadius: '50px',
            color: 'var(--maroon-primary)',
            fontWeight: '600',
            fontSize: '0.875rem',
            marginBottom: '0.75rem'
          }}>
            <Sparkles size={16} style={{ color: 'var(--gold-primary)' }} />
            Visit Our Bakery Studio
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--chocolate-dark)', fontSize: '2.4rem', fontWeight: '700' }}>
            Find Sweet Haven Near You
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0.5rem auto 0 auto', fontSize: '1rem' }}>
            Experience freshly baked artisan treats, custom cake consultations, and rich Belgian cocoa aromas at our boutique storefront.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'stretch' }}>
          
          {/* Left Column: Interactive Google Map Container */}
          <div style={{
            position: 'relative',
            minHeight: '380px',
            borderRadius: '20px',
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.06)',
            backgroundColor: '#ffffff'
          }}>
            {/* Live Google Map canvas when API key is provided */}
            {apiKey && !mapError ? (
              <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '380px' }} />
            ) : (
              /* Fallback Visual Preview Container when API key is pending or loading */
              <div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                minHeight: '380px',
                backgroundImage: 'radial-gradient(circle at 50% 50%, #f7f3e9 0%, #e9e2d0 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--maroon-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--gold-primary)',
                  boxShadow: '0 8px 20px rgba(88, 17, 26, 0.3)',
                  marginBottom: '1rem'
                }}>
                  <MapPin size={36} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--chocolate-dark)', margin: '0 0 0.5rem 0', fontSize: '1.4rem' }}>
                  Sweet Haven Flagship Studio
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '320px', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                  {storeAddress}
                </p>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-gold"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.4rem', fontSize: '0.9rem' }}
                >
                  <Navigation size={16} /> Open Directions on Google Maps <ExternalLink size={14} />
                </a>

                {/* Friendly Configuration Note */}
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  right: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  padding: '0.5rem 0.8rem',
                  borderRadius: '10px',
                  border: '1px solid var(--gold-primary)',
                  fontSize: '0.775rem',
                  color: 'var(--chocolate-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backdropFilter: 'blur(4px)'
                }}>
                  <AlertCircle size={15} style={{ color: 'var(--maroon-primary)', flexShrink: 0 }} />
                  <span>Google Maps Live API: Add your key in <code style={{ backgroundColor: '#eee', padding: '1px 4px', borderRadius: '3px' }}>client/.env</code> (<code style={{ backgroundColor: '#eee', padding: '1px 4px', borderRadius: '3px' }}>VITE_GOOGLE_MAPS_API_KEY</code>).</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Info Card Beside Map */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '2.25rem',
            border: '1px solid var(--border-color)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--maroon-primary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
                <ShieldCheck size={16} style={{ color: 'var(--gold-primary)' }} />
                Verified Flagship Boutique
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--chocolate-dark)', fontSize: '1.75rem', marginBottom: '1.25rem', fontWeight: '700' }}>
                Store Information
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ padding: '0.6rem', backgroundColor: 'rgba(88, 17, 26, 0.08)', borderRadius: '12px', color: 'var(--maroon-primary)' }}>
                    <MapPin size={22} />
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--chocolate-dark)', fontSize: '0.95rem' }}>Boutique Address</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>{storeAddress}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ padding: '0.6rem', backgroundColor: 'rgba(88, 17, 26, 0.08)', borderRadius: '12px', color: 'var(--maroon-primary)' }}>
                    <Clock size={22} />
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--chocolate-dark)', fontSize: '0.95rem' }}>Opening Hours</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{storeHours}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ padding: '0.6rem', backgroundColor: 'rgba(88, 17, 26, 0.08)', borderRadius: '12px', color: 'var(--maroon-primary)' }}>
                    <Phone size={22} />
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--chocolate-dark)', fontSize: '0.95rem' }}>Store Reservations & Inquiries</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{storePhone}</span>
                  </div>
                </div>

              </div>
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-gold"
                style={{ flex: 1, textAlign: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.8rem 1.2rem', fontSize: '0.95rem' }}
              >
                <Navigation size={18} /> Get Directions
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
