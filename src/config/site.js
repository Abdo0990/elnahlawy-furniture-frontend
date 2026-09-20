export const SITE = {
  name: 'معرض النحلاوي للأثاث',
  address: 'منفلوط، الطريق السريع، بجوار المحور ومدخل رميح',
  mapUrl: 'https://maps.app.goo.gl/Z9QoRqEfHi2o3WKBA',
  facebookUrl: 'https://web.facebook.com/profile.php?id=100069171546782',
  phones: [
    { display: '01110080051', href: 'tel:+201110080051' },
    { display: '01013111973', href: 'tel:+201013111973' },
  ],
  whatsappNumber: '201013111973',
};

export function getWhatsAppUrl(message) {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function getWhatsAppShareUrl(message) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
