/**
 * DTB Technologies Digital Museum - 3D Project Models
 * Configuration and metadata for 3D models of projects
 */

// Project model configurations
const ProjectModels = [
  {
    id: 'dtbtech',
    name: 'DTB Technologies Main Site',
    description: 'The primary corporate website showcasing our services and capabilities.',
    modelUrl: '../assets/models/website-model.glb',
    thumbnailUrl: '../assets/thumbnails/dtbtech-thumb.jpg',
    scale: 1.0,
    position: [0, 0, 0],
    rotation: [0, Math.PI / 4, 0], // Rotate to present at an angle
    cameraPosition: [3, 2, 3],
    hotspots: [
      {
        position: [0.5, 1, 0.5],
        title: 'Responsive Design',
        description: 'Fully responsive UI adapts to all screen sizes',
        color: 0x3b82f6 // blue-500
      },
      {
        position: [-0.5, 0.5, 0.5],
        title: 'Interactive Elements',
        description: 'Rich interactive components enhance user experience',
        color: 0x8b5cf6 // violet-500
      },
      {
        position: [0, 0.8, -0.8],
        title: 'Backend Integration',
        description: 'Powerful API and database connectivity',
        color: 0xec4899 // pink-500
      }
    ]
  },
  {
    id: 'lnb-store',
    name: 'Linda\'s Nut Butter Store',
    description: 'E-commerce platform for artisanal nut butter products with secure checkout.',
    modelUrl: '../assets/models/ecommerce-model.glb',
    thumbnailUrl: '../assets/thumbnails/lnb-thumb.jpg',
    scale: 0.8,
    position: [0, -0.2, 0],
    rotation: [0, 0, 0],
    cameraPosition: [2.5, 1.5, 2.5],
    hotspots: [
      {
        position: [0.7, 0.6, 0],
        title: 'Shopping Cart',
        description: 'Real-time cart updates with product management',
        color: 0x22c55e // green-500
      },
      {
        position: [-0.5, 0.4, 0.3],
        title: 'Payment Processing',
        description: 'Secure payment gateway integration',
        color: 0xef4444 // red-500
      },
      {
        position: [0, 0.7, -0.5],
        title: 'Product Catalog',
        description: 'Dynamic product listings with filtering',
        color: 0xf59e0b // amber-500
      }
    ]
  },
  {
    id: 'mopatience',
    name: 'MOPATIENCE ORGANIZATION',
    description: 'Non-profit platform with donation capabilities and volunteer management.',
    modelUrl: '../assets/models/nonprofit-model.glb',
    thumbnailUrl: '../assets/thumbnails/mopatience-thumb.jpg',
    scale: 0.9,
    position: [0, -0.1, 0],
    rotation: [0, -Math.PI / 6, 0],
    cameraPosition: [3, 1.8, 3],
    hotspots: [
      {
        position: [0.6, 0.8, 0.2],
        title: 'Donation System',
        description: 'Secure donation processing with receipt generation',
        color: 0x0ea5e9 // sky-500
      },
      {
        position: [-0.4, 0.5, 0.4],
        title: 'Event Calendar',
        description: 'Interactive community event management',
        color: 0xd946ef // fuchsia-500
      },
      {
        position: [0.1, 0.3, -0.7],
        title: 'Volunteer Portal',
        description: 'Volunteer sign-up and schedule management',
        color: 0xf97316 // orange-500
      }
    ]
  },
  {
    id: 'netmanage',
    name: 'NetManage Pro',
    description: 'Network management system with monitoring and diagnostics capabilities.',
    modelUrl: '../assets/models/network-model.glb',
    thumbnailUrl: '../assets/thumbnails/netmanage-thumb.jpg',
    scale: 1.1,
    position: [0, 0.1, 0],
    rotation: [0, Math.PI / 3, 0],
    cameraPosition: [3.5, 2.2, 3.5],
    hotspots: [
      {
        position: [0.8, 0.6, 0.3],
        title: 'Network Topology',
        description: 'Interactive visualization of network structure',
        color: 0x06b6d4 // cyan-500
      },
      {
        position: [-0.6, 0.4, 0.5],
        title: 'Real-time Monitoring',
        description: 'Live traffic and performance metrics',
        color: 0x14b8a6 // teal-500
      },
      {
        position: [0.2, 0.7, -0.6],
        title: 'Alert System',
        description: 'Customizable notifications for network events',
        color: 0xf43f5e // rose-500
      }
    ]
  },
  {
    id: 'securepay',
    name: 'SecurePay Mobile',
    description: 'Mobile banking application with integrated M-PESA transactions and financial analytics.',
    modelUrl: '../assets/models/mobile-app-model.glb',
    thumbnailUrl: '../assets/thumbnails/securepay-thumb.jpg',
    scale: 0.7,
    position: [0, -0.1, 0],
    rotation: [0, -Math.PI / 5, 0],
    cameraPosition: [2, 1.2, 2],
    hotspots: [
      {
        position: [0.3, 0.9, 0.1],
        title: 'Secure Authentication',
        description: 'Multi-factor authentication system',
        color: 0x7c3aed // purple-600
      },
      {
        position: [-0.3, 0.5, 0.3],
        title: 'M-PESA Integration',
        description: 'Seamless mobile payment processing',
        color: 0x059669 // emerald-600
      },
      {
        position: [0.1, 0.4, -0.4],
        title: 'Financial Dashboard',
        description: 'Personal finance tracking and analysis',
        color: 0xdc2626 // red-600
      }
    ]
  }
];

// Placeholder model for development (for when actual models are not available)
const PlaceholderModels = [
  {
    id: 'dtbtech-placeholder',
    name: 'DTB Technologies Main Site',
    description: 'The primary corporate website showcasing our services and capabilities.',
    modelUrl: 'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf',
    thumbnailUrl: '../assets/thumbnails/dtbtech-thumb.jpg',
    scale: 2.0,
    position: [0, 0, 0],
    rotation: [0, Math.PI / 4, 0],
    cameraPosition: [3, 0, 3],
    hotspots: [
      {
        position: [0.5, 0.5, 0.5],
        title: 'Responsive Design',
        description: 'Fully responsive UI adapts to all screen sizes',
        color: 0x3b82f6 // blue-500
      }
    ]
  },
  {
    id: 'lnb-placeholder',
    name: 'Linda\'s Nut Butter Store',
    description: 'E-commerce platform for artisanal nut butter products with secure checkout.',
    modelUrl: 'https://threejs.org/examples/models/gltf/LittlestTokyo.glb',
    thumbnailUrl: '../assets/thumbnails/lnb-thumb.jpg',
    scale: 0.01,
    position: [0, -1, 0],
    rotation: [0, 0, 0],
    cameraPosition: [10, 5, 10],
    hotspots: [
      {
        position: [3, 2, 1],
        title: 'Shopping Cart',
        description: 'Real-time cart updates with product management',
        color: 0x22c55e // green-500
      }
    ]
  }
];

// Export both actual and placeholder models
export { ProjectModels, PlaceholderModels };
