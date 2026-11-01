const GUNS_LOCAL = [
  {
    id: 'local-1',
    name: 'Glock 19 Gen 5',
    type: 'Pistol',
    caliber: '9mm',
    price: 549,
    description: 'Compact striker-fired sidearm featuring marksman barrel and dual recoil spring assembly.',
    image_url: '/guns/pistol.svg',
    ingredients: [
      { name: 'Receiver', quantity: 'Polymer' },
      { name: 'Barrel Length', quantity: '4.02 inches' },
      { name: 'Capacity', quantity: '15+1 rounds' }
    ],
    steps: [
      'Perform safety check and verify chamber is clear.',
      'Field strip frame and slide assembly for maintenance.'
    ]
  },
  {
    id: 'local-2',
    name: 'Colt M4A1 Carbine',
    type: 'Rifle',
    caliber: '5.56mm NATO',
    price: 1299,
    description: 'Select-fire tactical rifle engineered with direct impingement operating system.',
    image_url: '/guns/rifle.svg',
    ingredients: [
      { name: 'Receiver', quantity: '7075-T6 Aluminum' },
      { name: 'Barrel Length', quantity: '14.5 inches' },
      { name: 'Capacity', quantity: '30 rounds' }
    ],
    steps: [
      'Ensure safety selector is in safe position.',
      'Disassemble upper and lower receiver pins.'
    ]
  },
  {
    id: 'local-3',
    name: 'Remington 870 Tactical',
    type: 'Shotgun',
    caliber: '12 Gauge',
    price: 489,
    description: 'Pump-action smoothbore shotgun with solid steel receiver.',
    image_url: '/guns/shotgun.svg',
    ingredients: [
      { name: 'Receiver', quantity: 'Milled Steel' },
      { name: 'Barrel Length', quantity: '18.5 inches' },
      { name: 'Chamber', quantity: '3 inch Magnum' }
    ],
    steps: [
      'Depress action bar lock and open bolt fully.',
      'Inspect tubular magazine tube.'
    ]
  }
]

export default GUNS_LOCAL