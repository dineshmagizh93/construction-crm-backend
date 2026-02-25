import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with professional data...\n');

  // Create a professional construction company
  const company = await prisma.company.upsert({
    where: { email: 'info@premierbuilders.com' },
    update: {},
    create: {
      name: 'Premier Builders & Construction',
      email: 'info@premierbuilders.com',
      phone: '+1 (212) 555-8472',
      address: '2847 Madison Avenue, Suite 1200',
      city: 'New York',
      state: 'NY',
      zipCode: '10016',
      country: 'United States',
      website: 'https://www.premierbuilders.com',
      taxId: 'EIN-45-7892341',
    },
  });

  console.log('✅ Created company:', company.name);

  // Create professional users
  const hashedPassword = await bcrypt.hash('Admin@2024', 10);
  const adminUser = await prisma.user.upsert({
    where: {
      companyId_email: {
        companyId: company.id,
        email: 'michael.chen@premierbuilders.com',
      },
    },
    update: {},
    create: {
      companyId: company.id,
      email: 'michael.chen@premierbuilders.com',
      password: hashedPassword,
      firstName: 'Michael',
      lastName: 'Chen',
      role: 'admin',
      isActive: true,
      isApproved: true,
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  const projectManager = await prisma.user.upsert({
    where: {
      companyId_email: {
        companyId: company.id,
        email: 'jennifer.martinez@premierbuilders.com',
      },
    },
    update: {},
    create: {
      companyId: company.id,
      email: 'jennifer.martinez@premierbuilders.com',
      password: hashedPassword,
      firstName: 'Jennifer',
      lastName: 'Martinez',
      role: 'user',
      isActive: true,
      isApproved: true,
    },
  });

  console.log('✅ Created project manager:', projectManager.email);

  const siteSupervisor = await prisma.user.upsert({
    where: {
      companyId_email: {
        companyId: company.id,
        email: 'robert.williams@premierbuilders.com',
      },
    },
    update: {},
    create: {
      companyId: company.id,
      email: 'robert.williams@premierbuilders.com',
      password: hashedPassword,
      firstName: 'Robert',
      lastName: 'Williams',
      role: 'user',
      isActive: true,
      isApproved: true,
    },
  });

  console.log('✅ Created site supervisor:', siteSupervisor.email);

  const estimator = await prisma.user.upsert({
    where: {
      companyId_email: {
        companyId: company.id,
        email: 'sarah.johnson@premierbuilders.com',
      },
    },
    update: {},
    create: {
      companyId: company.id,
      email: 'sarah.johnson@premierbuilders.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'user',
      isActive: true,
      isApproved: true,
    },
  });

  console.log('✅ Created estimator:', estimator.email);

  // Check if sample data already exists
  const existingProjects = await prisma.project.count({
    where: { companyId: company.id },
  });

  if (existingProjects > 0) {
    console.log('\n⚠️  Data already exists. Skipping data seeding.');
    console.log('   To reseed, delete existing data first.\n');
    return;
  }

  console.log('\n📦 Creating professional data for all modules...\n');

  // Create Vendors
  console.log('Creating vendors...');
  const vendors = await Promise.all([
    prisma.vendor.create({
      data: {
        companyId: company.id,
        name: 'Metro Steel & Supply Co.',
        type: 'Material Supplier',
        contactPerson: 'David Thompson',
        phone: '+1 (718) 555-3291',
        email: 'dthompson@metrosteeel.com',
        address: '4521 Industrial Boulevard, Brooklyn, NY 11232',
        status: 'Active',
        notes: 'Primary supplier for structural steel, rebar, and metal framing. 15+ years partnership.',
      },
    }),
    prisma.vendor.create({
      data: {
        companyId: company.id,
        name: 'Empire Concrete Solutions',
        type: 'Material Supplier',
        contactPerson: 'Patricia Rodriguez',
        phone: '+1 (516) 555-7842',
        email: 'prodriguez@empireconcrete.com',
        address: '8923 Queens Boulevard, Queens, NY 11375',
        status: 'Active',
        notes: 'Ready-mix concrete supplier. Same-day delivery available. Preferred vendor for large pours.',
      },
    }),
    prisma.vendor.create({
      data: {
        companyId: company.id,
        name: 'Apex Equipment Rentals',
        type: 'Equipment Rental',
        contactPerson: 'James Anderson',
        phone: '+1 (347) 555-2156',
        email: 'janderson@apexequipment.com',
        address: '1567 Long Island Expressway, Hauppauge, NY 11788',
        status: 'Active',
        notes: 'Heavy machinery, cranes, excavators, and construction equipment. Monthly rental agreements available.',
      },
    }),
    prisma.vendor.create({
      data: {
        companyId: company.id,
        name: 'Elite Electrical Services',
        type: 'Subcontractor',
        contactPerson: 'Kevin Mitchell',
        phone: '+1 (914) 555-6723',
        email: 'kmitchell@eliteelectrical.com',
        address: '3245 Main Street, White Plains, NY 10601',
        status: 'Active',
        notes: 'Licensed electrical contractor. Specializes in commercial and industrial installations.',
      },
    }),
    prisma.vendor.create({
      data: {
        companyId: company.id,
        name: 'Precision Plumbing & HVAC',
        type: 'Subcontractor',
        contactPerson: 'Maria Garcia',
        phone: '+1 (631) 555-4891',
        email: 'mgarcia@precisionph.com',
        address: '7895 Jericho Turnpike, Commack, NY 11725',
        status: 'Active',
        notes: 'Full-service plumbing and HVAC contractor. Available for emergency repairs.',
      },
    }),
    prisma.vendor.create({
      data: {
        companyId: company.id,
        name: 'GreenScape Landscaping',
        type: 'Subcontractor',
        contactPerson: 'Thomas Brown',
        phone: '+1 (516) 555-9234',
        email: 'tbrown@greenscape.com',
        address: '2145 Northern Boulevard, Manhasset, NY 11030',
        status: 'Active',
        notes: 'Landscaping, hardscaping, and site preparation. Certified in sustainable practices.',
      },
    }),
    prisma.vendor.create({
      data: {
        companyId: company.id,
        name: 'City Lumber & Building Materials',
        type: 'Material Supplier',
        contactPerson: 'Lisa Chen',
        phone: '+1 (718) 555-4567',
        email: 'lchen@citylumber.com',
        address: '5678 Atlantic Avenue, Brooklyn, NY 11208',
        status: 'Active',
        notes: 'Lumber, plywood, drywall, and building materials. Bulk pricing available.',
      },
    }),
  ]);

  console.log(`✅ Created ${vendors.length} vendors`);

  // Create Projects
  console.log('Creating projects...');
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        companyId: company.id,
        name: 'Manhattan Financial District Office Tower',
        clientName: 'Manhattan Real Estate Holdings LLC',
        location: '125 Wall Street, New York, NY 10005',
        description: 'Construction of a 28-story Class A office building with ground-floor retail, underground parking for 150 vehicles, and state-of-the-art building systems. LEED Gold certification target.',
        startDate: new Date('2023-11-15'),
        endDate: new Date('2025-08-31'),
        status: 'In Progress',
        estimatedBudget: 125000000.00,
        actualBudget: 78450000.00,
        progress: 62,
      },
    }),
    prisma.project.create({
      data: {
        companyId: company.id,
        name: 'Riverside Luxury Condominium Complex',
        clientName: 'Riverside Development Partners',
        location: '2847 Riverside Drive, Manhattan, NY 10025',
        description: 'Luxury residential development featuring 3 buildings with 156 units total. Includes rooftop terraces, fitness center, concierge services, and underground parking.',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2026-03-15'),
        status: 'In Progress',
        estimatedBudget: 95000000.00,
        actualBudget: 34200000.00,
        progress: 36,
      },
    }),
    prisma.project.create({
      data: {
        companyId: company.id,
        name: 'Brooklyn Medical Center Expansion',
        clientName: 'Brooklyn Health Systems',
        location: '4512 Atlantic Avenue, Brooklyn, NY 11217',
        description: 'Expansion of existing medical facility including new 6-story patient wing, updated emergency department, and expanded parking structure. Phased construction to maintain hospital operations.',
        startDate: new Date('2023-08-20'),
        endDate: new Date('2025-05-30'),
        status: 'In Progress',
        estimatedBudget: 68000000.00,
        actualBudget: 48900000.00,
        progress: 72,
      },
    }),
    prisma.project.create({
      data: {
        companyId: company.id,
        name: 'Queens Shopping Center Renovation',
        clientName: 'Metro Retail Properties Inc',
        location: '7821 Queens Boulevard, Queens, NY 11373',
        description: 'Complete renovation of 250,000 sq ft shopping center including facade updates, interior modernization, new HVAC systems, and parking lot resurfacing. Maintaining operations during construction.',
        startDate: new Date('2024-01-10'),
        endDate: new Date('2024-12-20'),
        status: 'In Progress',
        estimatedBudget: 32000000.00,
        actualBudget: 19800000.00,
        progress: 62,
      },
    }),
    prisma.project.create({
      data: {
        companyId: company.id,
        name: 'Long Island Corporate Campus',
        clientName: 'TechCorp Industries',
        location: '1450 Corporate Drive, Melville, NY 11747',
        description: 'New corporate headquarters campus with 4 office buildings, conference center, employee cafeteria, and extensive landscaping. Sustainable design with solar panels and rainwater collection.',
        startDate: new Date('2024-04-15'),
        endDate: new Date('2026-01-31'),
        status: 'Planning',
        estimatedBudget: 145000000.00,
        actualBudget: 8500000.00,
        progress: 6,
      },
    }),
    prisma.project.create({
      data: {
        companyId: company.id,
        name: 'Staten Island School Modernization',
        clientName: 'NYC Department of Education',
        location: '2345 Victory Boulevard, Staten Island, NY 10314',
        description: 'Complete modernization of 1950s-era school building including new windows, HVAC replacement, ADA compliance upgrades, and technology infrastructure installation.',
        startDate: new Date('2022-06-01'),
        endDate: new Date('2024-02-28'),
        status: 'Completed',
        estimatedBudget: 18500000.00,
        actualBudget: 18250000.00,
        progress: 100,
      },
    }),
    prisma.project.create({
      data: {
        companyId: company.id,
        name: 'Bronx Affordable Housing Development',
        clientName: 'Bronx Community Housing Authority',
        location: '5678 Grand Concourse, Bronx, NY 10451',
        description: 'Construction of 8-story affordable housing building with 84 units, community room, and ground-floor commercial space. Energy-efficient design with solar panels.',
        startDate: new Date('2023-03-15'),
        endDate: new Date('2024-11-30'),
        status: 'In Progress',
        estimatedBudget: 42000000.00,
        actualBudget: 31500000.00,
        progress: 75,
      },
    }),
    prisma.project.create({
      data: {
        companyId: company.id,
        name: 'Westchester Hotel & Conference Center',
        clientName: 'Hospitality Ventures Group',
        location: '1234 White Plains Road, Tarrytown, NY 10591',
        description: 'New construction of 200-room hotel with conference facilities, restaurant, spa, and event spaces. Targeting completion for 2025 tourism season.',
        startDate: new Date('2024-05-01'),
        endDate: new Date('2025-10-15'),
        status: 'In Progress',
        estimatedBudget: 78000000.00,
        actualBudget: 23400000.00,
        progress: 30,
      },
    }),
  ]);

  console.log(`✅ Created ${projects.length} projects`);

  // Create Leads
  console.log('Creating leads...');
  const leads = await Promise.all([
    prisma.lead.create({
      data: {
        companyId: company.id,
        name: 'Hudson Valley Tech Park',
        phone: '+1 (845) 555-1234',
        email: 'development@hudsonvalleytech.com',
        type: 'LEAD',
        source: 'Website',
        status: 'Qualified',
        assignedTo: projectManager.id,
        notes: 'Inquiry for 500,000 sq ft tech park development. Initial meeting scheduled for next month. Strong financial backing confirmed.',
      },
    }),
    prisma.lead.create({
      data: {
        companyId: company.id,
        name: 'Nassau County Library System',
        phone: '+1 (516) 555-5678',
        email: 'facilities@nassaulibrary.org',
        type: 'CLIENT',
        source: 'Referral',
        status: 'Converted',
        assignedTo: adminUser.id,
        notes: 'Referred by Brooklyn Medical Center. Planning renovation of 5 branch libraries. RFP expected in Q2 2024.',
      },
    }),
    prisma.lead.create({
      data: {
        companyId: company.id,
        name: 'Suffolk Industrial Warehouse',
        phone: '+1 (631) 555-9012',
        email: 'logistics@warehousecorp.com',
        type: 'LEAD',
        source: 'Trade Show',
        status: 'Contacted',
        assignedTo: estimator.id,
        notes: 'Met at NY Construction Expo. Need 200,000 sq ft distribution center. Follow-up meeting scheduled.',
      },
    }),
    prisma.lead.create({
      data: {
        companyId: company.id,
        name: 'Manhattan Luxury Retail Space',
        phone: '+1 (212) 555-3456',
        email: 'leasing@premiumretail.com',
        type: 'LEAD',
        source: 'Direct',
        status: 'New',
        assignedTo: projectManager.id,
        notes: 'High-end retail space renovation in SoHo. Budget: $8-10M. Timeline: 12 months.',
      },
    }),
    prisma.lead.create({
      data: {
        companyId: company.id,
        name: 'Westchester Senior Living Facility',
        phone: '+1 (914) 555-7890',
        email: 'development@seniorcaregroup.com',
        type: 'LEAD',
        source: 'Website',
        status: 'Qualified',
        assignedTo: siteSupervisor.id,
        notes: '150-unit assisted living facility. Pre-construction phase. Strong interest in our healthcare construction experience.',
      },
    }),
    prisma.lead.create({
      data: {
        companyId: company.id,
        name: 'Queens Community Center',
        phone: '+1 (718) 555-2345',
        email: 'info@queenscommunity.org',
        type: 'LEAD',
        source: 'Referral',
        status: 'Contacted',
        assignedTo: estimator.id,
        notes: 'Referred by Bronx Housing Authority. Community center renovation project. Grant funding secured.',
      },
    }),
  ]);

  console.log(`✅ Created ${leads.length} leads`);

  // Create Payments
  console.log('Creating payments...');
  const payments = await Promise.all([
    prisma.payment.create({
      data: {
        companyId: company.id,
        projectId: projects[0].id,
        milestone: 'Foundation and Site Work Complete',
        amount: 15000000.00,
        dueDate: new Date('2024-01-15'),
        status: 'Paid',
        paidDate: new Date('2024-01-12'),
        notes: 'Foundation work completed ahead of schedule. Payment received via wire transfer.',
      },
    }),
    prisma.payment.create({
      data: {
        companyId: company.id,
        projectId: projects[0].id,
        milestone: 'Structural Steel Framework Complete',
        amount: 22000000.00,
        dueDate: new Date('2024-05-31'),
        status: 'Paid',
        paidDate: new Date('2024-05-28'),
        notes: 'All structural steel erected and inspected. Building envelope 80% complete.',
      },
    }),
    prisma.payment.create({
      data: {
        companyId: company.id,
        projectId: projects[0].id,
        milestone: 'MEP Rough-In Complete',
        amount: 18000000.00,
        dueDate: new Date('2024-10-15'),
        status: 'Pending',
        notes: 'Mechanical, electrical, and plumbing rough-in in progress. Expected completion mid-October.',
      },
    }),
    prisma.payment.create({
      data: {
        companyId: company.id,
        projectId: projects[0].id,
        milestone: 'Interior Finishes 50% Complete',
        amount: 15000000.00,
        dueDate: new Date('2025-02-28'),
        status: 'Pending',
        notes: 'Final milestone payment. Interior work ongoing.',
      },
    }),
    prisma.payment.create({
      data: {
        companyId: company.id,
        projectId: projects[1].id,
        milestone: 'Site Preparation and Excavation',
        amount: 8500000.00,
        dueDate: new Date('2024-02-15'),
        status: 'Paid',
        paidDate: new Date('2024-02-10'),
        notes: 'Site cleared, utilities relocated, excavation complete.',
      },
    }),
    prisma.payment.create({
      data: {
        companyId: company.id,
        projectId: projects[1].id,
        milestone: 'Foundation and First Floor Slab',
        amount: 12000000.00,
        dueDate: new Date('2024-06-30'),
        status: 'Paid',
        paidDate: new Date('2024-06-25'),
        notes: 'Foundation work complete for all three buildings. First floor slabs poured.',
      },
    }),
    prisma.payment.create({
      data: {
        companyId: company.id,
        projectId: projects[1].id,
        milestone: 'Building Framing Complete',
        amount: 14000000.00,
        dueDate: new Date('2024-12-31'),
        status: 'Pending',
        notes: 'Structural framing in progress. Target completion by year-end.',
      },
    }),
    prisma.payment.create({
      data: {
        companyId: company.id,
        projectId: projects[2].id,
        milestone: 'Phase 1 - Emergency Department Expansion',
        amount: 12500000.00,
        dueDate: new Date('2024-03-31'),
        status: 'Paid',
        paidDate: new Date('2024-03-28'),
        notes: 'Emergency department expansion completed and operational.',
      },
    }),
    prisma.payment.create({
      data: {
        companyId: company.id,
        projectId: projects[2].id,
        milestone: 'Phase 2 - Patient Wing Structure',
        amount: 18500000.00,
        dueDate: new Date('2024-09-30'),
        status: 'Pending',
        notes: 'New patient wing structure complete. Interior work beginning.',
      },
    }),
    prisma.payment.create({
      data: {
        companyId: company.id,
        projectId: projects[3].id,
        milestone: 'Exterior Renovation Complete',
        amount: 8500000.00,
        dueDate: new Date('2024-06-15'),
        status: 'Paid',
        paidDate: new Date('2024-06-12'),
        notes: 'Facade renovation and exterior improvements complete.',
      },
    }),
    prisma.payment.create({
      data: {
        companyId: company.id,
        projectId: projects[3].id,
        milestone: 'Interior Renovation 75% Complete',
        amount: 6500000.00,
        dueDate: new Date('2024-09-30'),
        status: 'Pending',
        notes: 'Interior renovation progressing on schedule.',
      },
    }),
    prisma.payment.create({
      data: {
        companyId: company.id,
        projectId: projects[6].id,
        milestone: 'Final Payment - Project Completion',
        amount: 4200000.00,
        dueDate: new Date('2024-11-15'),
        status: 'Pending',
        notes: 'Final payment upon project completion and final inspection.',
      },
    }),
  ]);

  console.log(`✅ Created ${payments.length} payments`);

  // Create Expenses
  console.log('Creating expenses...');
  const expenses = await Promise.all([
    prisma.expense.create({
      data: {
        companyId: company.id,
        projectId: projects[0].id,
        category: 'Materials',
        amount: 2850000.00,
        date: new Date('2023-12-05'),
        paidTo: vendors[0].name,
        notes: 'Structural steel delivery - 450 tons for foundation and first 10 floors',
        attachment: null,
      },
    }),
    prisma.expense.create({
      data: {
        companyId: company.id,
        projectId: projects[0].id,
        category: 'Materials',
        amount: 1250000.00,
        date: new Date('2023-12-18'),
        paidTo: vendors[1].name,
        notes: 'Ready-mix concrete - 2,500 cubic yards for foundation pour',
        attachment: null,
      },
    }),
    prisma.expense.create({
      data: {
        companyId: company.id,
        projectId: projects[0].id,
        category: 'Equipment',
        amount: 185000.00,
        date: new Date('2024-01-10'),
        paidTo: vendors[2].name,
        notes: 'Tower crane rental - 6 months, includes operator',
        attachment: null,
      },
    }),
    prisma.expense.create({
      data: {
        companyId: company.id,
        projectId: projects[0].id,
        category: 'Subcontractor',
        amount: 1250000.00,
        date: new Date('2024-02-20'),
        paidTo: vendors[3].name,
        notes: 'Electrical rough-in for floors 1-15. Includes materials and labor.',
        attachment: null,
      },
    }),
    prisma.expense.create({
      data: {
        companyId: company.id,
        projectId: projects[0].id,
        category: 'Labor',
        amount: 485000.00,
        date: new Date('2024-03-15'),
        paidTo: 'Construction Workers Local 79',
        notes: 'Monthly labor costs - 45 skilled workers, 2 weeks',
        attachment: null,
      },
    }),
    prisma.expense.create({
      data: {
        companyId: company.id,
        projectId: projects[1].id,
        category: 'Materials',
        amount: 1250000.00,
        date: new Date('2024-02-25'),
        paidTo: vendors[1].name,
        notes: 'Concrete for foundation and first floor slabs - 2,000 cubic yards',
        attachment: null,
      },
    }),
    prisma.expense.create({
      data: {
        companyId: company.id,
        projectId: projects[1].id,
        category: 'Materials',
        amount: 850000.00,
        date: new Date('2024-03-10'),
        paidTo: vendors[6].name,
        notes: 'Lumber and framing materials for Building A',
        attachment: null,
      },
    }),
    prisma.expense.create({
      data: {
        companyId: company.id,
        projectId: projects[1].id,
        category: 'Subcontractor',
        amount: 650000.00,
        date: new Date('2024-04-05'),
        paidTo: vendors[4].name,
        notes: 'Plumbing installation - rough-in for all three buildings',
        attachment: null,
      },
    }),
    prisma.expense.create({
      data: {
        companyId: company.id,
        projectId: projects[2].id,
        category: 'Materials',
        amount: 950000.00,
        date: new Date('2024-01-20'),
        paidTo: vendors[0].name,
        notes: 'Steel framing for new patient wing',
        attachment: null,
      },
    }),
    prisma.expense.create({
      data: {
        companyId: company.id,
        projectId: projects[2].id,
        category: 'Subcontractor',
        amount: 1850000.00,
        date: new Date('2024-02-15'),
        paidTo: vendors[3].name,
        notes: 'Complete electrical system upgrade - emergency department and new wing',
        attachment: null,
      },
    }),
    prisma.expense.create({
      data: {
        companyId: company.id,
        projectId: projects[3].id,
        category: 'Materials',
        amount: 450000.00,
        date: new Date('2024-02-01'),
        paidTo: vendors[6].name,
        notes: 'Drywall, paint, flooring materials for interior renovation',
        attachment: null,
      },
    }),
    prisma.expense.create({
      data: {
        companyId: company.id,
        projectId: projects[3].id,
        category: 'Subcontractor',
        amount: 320000.00,
        date: new Date('2024-03-20'),
        paidTo: vendors[4].name,
        notes: 'HVAC system replacement - 15 units',
        attachment: null,
      },
    }),
    prisma.expense.create({
      data: {
        companyId: company.id,
        projectId: projects[6].id,
        category: 'Materials',
        amount: 1250000.00,
        date: new Date('2023-05-10'),
        paidTo: vendors[1].name,
        notes: 'Concrete for foundation and structure - 1,800 cubic yards',
        attachment: null,
      },
    }),
    prisma.expense.create({
      data: {
        companyId: company.id,
        projectId: projects[7].id,
        category: 'Equipment',
        amount: 125000.00,
        date: new Date('2024-05-15'),
        paidTo: vendors[2].name,
        notes: 'Excavator and earthmoving equipment rental - 3 months',
        attachment: null,
      },
    }),
  ]);

  console.log(`✅ Created ${expenses.length} expenses`);

  // Create Site Progress
  console.log('Creating site progress entries...');
  const siteProgresses = await Promise.all([
    prisma.siteProgress.create({
      data: {
        companyId: company.id,
        projectId: projects[0].id,
        date: new Date('2024-01-15'),
        notes: 'Foundation work completed successfully. All concrete pours inspected and approved. Structural steel delivery scheduled for next week. Site safety measures in place.',
        photos: JSON.stringify(['foundation-complete-001.jpg', 'foundation-complete-002.jpg', 'steel-delivery-prep.jpg']),
      },
    }),
    prisma.siteProgress.create({
      data: {
        companyId: company.id,
        projectId: projects[0].id,
        date: new Date('2024-05-20'),
        notes: 'Structural steel framework complete through 20th floor. Building envelope installation in progress. MEP rough-in beginning on lower floors. On schedule.',
        photos: JSON.stringify(['steel-framework-001.jpg', 'building-envelope-001.jpg', 'mep-rough-in-001.jpg']),
      },
    }),
    prisma.siteProgress.create({
      data: {
        companyId: company.id,
        projectId: projects[0].id,
        date: new Date('2024-09-10'),
        notes: 'Building topped out at 28 floors. MEP systems 60% complete. Elevator installation in progress. Interior framing beginning on lower floors.',
        photos: JSON.stringify(['topping-out-ceremony.jpg', 'mep-progress-001.jpg', 'elevator-shaft-001.jpg']),
      },
    }),
    prisma.siteProgress.create({
      data: {
        companyId: company.id,
        projectId: projects[1].id,
        date: new Date('2024-03-05'),
        notes: 'Site preparation complete. All utilities relocated. Excavation finished for all three buildings. Foundation work beginning next week.',
        photos: JSON.stringify(['site-prep-complete-001.jpg', 'excavation-complete-001.jpg']),
      },
    }),
    prisma.siteProgress.create({
      data: {
        companyId: company.id,
        projectId: projects[1].id,
        date: new Date('2024-07-15'),
        notes: 'Foundation complete for all buildings. First floor slabs poured. Framing materials delivered. Structural framing beginning for Building A.',
        photos: JSON.stringify(['foundation-complete-001.jpg', 'slab-pour-001.jpg', 'framing-materials.jpg']),
      },
    }),
    prisma.siteProgress.create({
      data: {
        companyId: company.id,
        projectId: projects[2].id,
        date: new Date('2024-03-25'),
        notes: 'Phase 1 - Emergency Department expansion completed and operational. Patient flow maintained throughout construction. Phase 2 - New patient wing structure complete.',
        photos: JSON.stringify(['ed-expansion-complete-001.jpg', 'patient-wing-structure-001.jpg']),
      },
    }),
    prisma.siteProgress.create({
      data: {
        companyId: company.id,
        projectId: projects[2].id,
        date: new Date('2024-08-20'),
        notes: 'Patient wing interior work 50% complete. MEP systems installed. Drywall and finishes in progress. On track for Q2 2025 completion.',
        photos: JSON.stringify(['interior-progress-001.jpg', 'mep-installation-001.jpg', 'drywall-progress-001.jpg']),
      },
    }),
    prisma.siteProgress.create({
      data: {
        companyId: company.id,
        projectId: projects[3].id,
        date: new Date('2024-06-10'),
        notes: 'Exterior renovation complete. New facade installed. Storefronts updated. Interior renovation 40% complete. Minimal disruption to tenant operations.',
        photos: JSON.stringify(['exterior-complete-001.jpg', 'storefront-update-001.jpg', 'interior-renovation-001.jpg']),
      },
    }),
    prisma.siteProgress.create({
      data: {
        companyId: company.id,
        projectId: projects[6].id,
        date: new Date('2024-08-15'),
        notes: 'Building structure complete. MEP systems installed. Exterior cladding 90% complete. Interior finishes beginning. On schedule for November completion.',
        photos: JSON.stringify(['structure-complete-001.jpg', 'cladding-progress-001.jpg', 'interior-start-001.jpg']),
      },
    }),
    prisma.siteProgress.create({
      data: {
        companyId: company.id,
        projectId: projects[7].id,
        date: new Date('2024-06-20'),
        notes: 'Site clearing and excavation complete. Foundation work beginning. Utilities being installed. Site logistics established.',
        photos: JSON.stringify(['site-clearing-001.jpg', 'excavation-progress-001.jpg', 'utilities-install-001.jpg']),
      },
    }),
  ]);

  console.log(`✅ Created ${siteProgresses.length} site progress entries`);

  // Create Labour
  console.log('Creating labour entries...');
  const labours = await Promise.all([
    prisma.labour.create({
      data: {
        companyId: company.id,
        projectId: projects[0].id,
        category: 'Skilled Workers',
        headcount: 28,
        costPerDay: 320.00,
        date: new Date('2024-01-20'),
        notes: 'Steel workers and welders - foundation and structural steel installation',
      },
    }),
    prisma.labour.create({
      data: {
        companyId: company.id,
        projectId: projects[0].id,
        category: 'General Labor',
        headcount: 35,
        costPerDay: 195.00,
        date: new Date('2024-02-15'),
        notes: 'General construction workers - concrete work and material handling',
      },
    }),
    prisma.labour.create({
      data: {
        companyId: company.id,
        projectId: projects[0].id,
        category: 'Skilled Workers',
        headcount: 22,
        costPerDay: 340.00,
        date: new Date('2024-06-10'),
        notes: 'Electricians and plumbers - MEP rough-in installation',
      },
    }),
    prisma.labour.create({
      data: {
        companyId: company.id,
        projectId: projects[0].id,
        category: 'General Labor',
        headcount: 18,
        costPerDay: 185.00,
        date: new Date('2024-09-05'),
        notes: 'Interior framing crew - drywall installation and preparation',
      },
    }),
    prisma.labour.create({
      data: {
        companyId: company.id,
        projectId: projects[1].id,
        category: 'General Labor',
        headcount: 25,
        costPerDay: 190.00,
        date: new Date('2024-03-10'),
        notes: 'Site preparation and excavation crew',
      },
    }),
    prisma.labour.create({
      data: {
        companyId: company.id,
        projectId: projects[1].id,
        category: 'Skilled Workers',
        headcount: 20,
        costPerDay: 310.00,
        date: new Date('2024-07-20'),
        notes: 'Framing crew - structural framing for all three buildings',
      },
    }),
    prisma.labour.create({
      data: {
        companyId: company.id,
        projectId: projects[2].id,
        category: 'Skilled Workers',
        headcount: 15,
        costPerDay: 330.00,
        date: new Date('2024-02-25'),
        notes: 'Electrical and HVAC specialists - system installation and upgrades',
      },
    }),
    prisma.labour.create({
      data: {
        companyId: company.id,
        projectId: projects[3].id,
        category: 'General Labor',
        headcount: 12,
        costPerDay: 180.00,
        date: new Date('2024-03-15'),
        notes: 'Renovation crew - interior demolition and preparation',
      },
    }),
    prisma.labour.create({
      data: {
        companyId: company.id,
        projectId: projects[6].id,
        category: 'Skilled Workers',
        headcount: 18,
        costPerDay: 300.00,
        date: new Date('2024-08-10'),
        notes: 'Finishing crew - interior finishes and final touches',
      },
    }),
    prisma.labour.create({
      data: {
        companyId: company.id,
        projectId: projects[7].id,
        category: 'General Labor',
        headcount: 20,
        costPerDay: 195.00,
        date: new Date('2024-06-15'),
        notes: 'Site preparation and foundation crew',
      },
    }),
  ]);

  console.log(`✅ Created ${labours.length} labour entries`);

  // Create Documents
  console.log('Creating documents...');
  const documents = await Promise.all([
    prisma.document.create({
      data: {
        companyId: company.id,
        projectId: projects[0].id,
        name: 'Building Permit - DOB Approval',
        type: 'Permit',
        fileUrl: '/uploads/documents/wall-street-permit-001.pdf',
        fileName: 'wall-street-permit-001.pdf',
        fileSize: 2457600,
        notes: 'Department of Buildings permit approval for 28-story office tower. Permit #NB-2023-0456789',
        uploadedBy: adminUser.id,
      },
    }),
    prisma.document.create({
      data: {
        companyId: company.id,
        projectId: projects[0].id,
        name: 'Architectural Plans - Complete Set',
        type: 'Plan',
        fileUrl: '/uploads/documents/wall-street-architectural-plans.pdf',
        fileName: 'wall-street-architectural-plans.pdf',
        fileSize: 52428800,
        notes: 'Complete architectural drawing set - 150 sheets. Includes structural, MEP, and interior design drawings.',
        uploadedBy: projectManager.id,
      },
    }),
    prisma.document.create({
      data: {
        companyId: company.id,
        projectId: projects[0].id,
        name: 'Construction Contract Agreement',
        type: 'Contract',
        fileUrl: '/uploads/documents/wall-street-contract.pdf',
        fileName: 'wall-street-contract.pdf',
        fileSize: 10240000,
        notes: 'Signed construction contract with Manhattan Real Estate Holdings LLC. Contract value: $125M',
        uploadedBy: adminUser.id,
      },
    }),
    prisma.document.create({
      data: {
        companyId: company.id,
        projectId: projects[0].id,
        name: 'Foundation Inspection Report',
        type: 'Report',
        fileUrl: '/uploads/documents/foundation-inspection-001.pdf',
        fileName: 'foundation-inspection-001.pdf',
        fileSize: 2048000,
        notes: 'Third-party foundation inspection report. All tests passed. Ready for structural steel installation.',
        uploadedBy: siteSupervisor.id,
      },
    }),
    prisma.document.create({
      data: {
        companyId: company.id,
        projectId: projects[1].id,
        name: 'Site Survey and Topography Report',
        type: 'Report',
        fileUrl: '/uploads/documents/riverside-site-survey.pdf',
        fileName: 'riverside-site-survey.pdf',
        fileSize: 5120000,
        notes: 'Complete site survey including topography, soil analysis, and utility mapping.',
        uploadedBy: projectManager.id,
      },
    }),
    prisma.document.create({
      data: {
        companyId: company.id,
        projectId: projects[1].id,
        name: 'Environmental Impact Assessment',
        type: 'Report',
        fileUrl: '/uploads/documents/riverside-eia.pdf',
        fileName: 'riverside-eia.pdf',
        fileSize: 8192000,
        notes: 'Environmental impact assessment required for residential development. Approved by DEC.',
        uploadedBy: adminUser.id,
      },
    }),
    prisma.document.create({
      data: {
        companyId: company.id,
        projectId: projects[2].id,
        name: 'Healthcare Facility Construction Permit',
        type: 'Permit',
        fileUrl: '/uploads/documents/medical-center-permit.pdf',
        fileName: 'medical-center-permit.pdf',
        fileSize: 3072000,
        notes: 'Special permit for healthcare facility expansion. Includes infection control protocols.',
        uploadedBy: adminUser.id,
      },
    }),
    prisma.document.create({
      data: {
        companyId: company.id,
        projectId: projects[3].id,
        name: 'Renovation Proposal and Scope',
        type: 'Proposal',
        fileUrl: '/uploads/documents/queens-shopping-proposal.pdf',
        fileName: 'queens-shopping-proposal.pdf',
        fileSize: 6144000,
        notes: 'Detailed renovation proposal including phasing plan to maintain tenant operations.',
        uploadedBy: estimator.id,
      },
    }),
    prisma.document.create({
      data: {
        companyId: company.id,
        projectId: projects[5].id,
        name: 'Project Completion Certificate',
        type: 'Certificate',
        fileUrl: '/uploads/documents/staten-island-completion.pdf',
        fileName: 'staten-island-completion.pdf',
        fileSize: 1536000,
        notes: 'Certificate of completion issued by NYC Department of Education. Final inspection passed.',
        uploadedBy: adminUser.id,
      },
    }),
    prisma.document.create({
      data: {
        companyId: company.id,
        projectId: projects[6].id,
        name: 'Affordable Housing Compliance Documentation',
        type: 'Report',
        fileUrl: '/uploads/documents/bronx-housing-compliance.pdf',
        fileName: 'bronx-housing-compliance.pdf',
        fileSize: 4096000,
        notes: 'Documentation for affordable housing compliance requirements and certifications.',
        uploadedBy: projectManager.id,
      },
    }),
  ]);

  console.log(`✅ Created ${documents.length} documents`);

  // Create Inventory Items
  console.log('Creating inventory items...');
  const inventoryItems = await Promise.all([
    prisma.inventoryItem.create({
      data: {
        companyId: company.id,
        name: 'Portland Cement Type I',
        description: 'Standard Portland cement, 94 lb bags. ASTM C150 compliant.',
        category: 'Construction Materials',
        unit: 'Bag',
        currentStock: 1250.00,
        minStock: 500.00,
        unitPrice: 14.75,
        vendorId: vendors[1].id,
        location: 'Warehouse A - Bay 12',
        sku: 'CEMENT-PC-TYPE1-94LB',
        notes: 'Primary cement for all projects. Reorder when stock drops below 500 bags.',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        companyId: company.id,
        name: 'Steel Rebar #4 (1/2 inch)',
        description: 'Grade 60 deformed steel rebar, 1/2 inch diameter, 20 ft lengths',
        category: 'Construction Materials',
        unit: 'Ton',
        currentStock: 28.50,
        minStock: 10.00,
        unitPrice: 925.00,
        vendorId: vendors[0].id,
        location: 'Yard Storage - Section B',
        sku: 'REBAR-4-GRADE60',
        notes: 'Standard rebar for concrete reinforcement. Stock levels monitored weekly.',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        companyId: company.id,
        name: 'PVC Pipe Schedule 40 - 4 inch',
        description: 'PVC pipe, Schedule 40, 4 inch diameter, 10 ft lengths',
        category: 'Plumbing',
        unit: 'Length',
        currentStock: 85.00,
        minStock: 30.00,
        unitPrice: 42.50,
        vendorId: vendors[4].id,
        location: 'Warehouse B - Bay 8',
        sku: 'PVC-4IN-SCH40-10FT',
        notes: 'Standard plumbing pipe for drainage and water lines.',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        companyId: company.id,
        name: 'Copper Wire 12 AWG THHN',
        description: 'Copper electrical wire, 12 AWG, THHN insulation, 500 ft spool',
        category: 'Electrical',
        unit: 'Spool',
        currentStock: 24.00,
        minStock: 12.00,
        unitPrice: 145.00,
        vendorId: vendors[3].id,
        location: 'Warehouse B - Bay 15',
        sku: 'WIRE-12AWG-THHN-500FT',
        notes: 'Standard electrical wiring for branch circuits. UL listed.',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        companyId: company.id,
        name: 'Concrete Block 8x8x16',
        description: 'Standard concrete masonry unit, 8x8x16 inches, solid',
        category: 'Construction Materials',
        unit: 'Block',
        currentStock: 4850.00,
        minStock: 2000.00,
        unitPrice: 2.85,
        vendorId: vendors[6].id,
        location: 'Yard Storage - Section C',
        sku: 'BLOCK-8X8X16-SOLID',
        notes: 'Standard building block for walls and foundations.',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        companyId: company.id,
        name: 'Drywall 1/2 inch - 4x8 Sheet',
        description: 'Standard drywall, 1/2 inch thickness, 4x8 feet',
        category: 'Construction Materials',
        unit: 'Sheet',
        currentStock: 320.00,
        minStock: 150.00,
        unitPrice: 18.50,
        vendorId: vendors[6].id,
        location: 'Warehouse A - Bay 5',
        sku: 'DRYWALL-1-2-4X8',
        notes: 'Standard interior drywall. Keep protected from moisture.',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        companyId: company.id,
        name: 'Structural Steel I-Beam W12x26',
        description: 'Wide flange structural steel beam, W12x26, Grade 50',
        category: 'Construction Materials',
        unit: 'Foot',
        currentStock: 450.00,
        minStock: 200.00,
        unitPrice: 12.50,
        vendorId: vendors[0].id,
        location: 'Yard Storage - Section A',
        sku: 'STEEL-W12X26-GR50',
        notes: 'Structural steel for framing. Ordered as needed for specific projects.',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        companyId: company.id,
        name: 'Electrical Panel 200A Main Breaker',
        description: '200 amp main electrical panel, 40 circuit spaces, NEMA 3R rated',
        category: 'Electrical',
        unit: 'Panel',
        currentStock: 8.00,
        minStock: 4.00,
        unitPrice: 485.00,
        vendorId: vendors[3].id,
        location: 'Warehouse B - Bay 12',
        sku: 'PANEL-200A-40CKT',
        notes: 'Main electrical service panels. UL listed, suitable for outdoor installation.',
      },
    }),
  ]);

  console.log(`✅ Created ${inventoryItems.length} inventory items`);

  // Create Inventory Transactions
  console.log('Creating inventory transactions...');
  const inventoryTransactions = await Promise.all([
    prisma.inventoryTransaction.create({
      data: {
        companyId: company.id,
        itemId: inventoryItems[0].id,
        type: 'OUT',
        quantity: 450.00,
        projectId: projects[0].id,
        reference: 'PO-2024-001',
        notes: 'Cement for foundation and initial concrete pours',
        transactionDate: new Date('2023-12-10'),
      },
    }),
    prisma.inventoryTransaction.create({
      data: {
        companyId: company.id,
        itemId: inventoryItems[1].id,
        type: 'OUT',
        quantity: 12.50,
        projectId: projects[0].id,
        reference: 'PO-2024-002',
        notes: 'Rebar for foundation reinforcement',
        transactionDate: new Date('2023-12-15'),
      },
    }),
    prisma.inventoryTransaction.create({
      data: {
        companyId: company.id,
        itemId: inventoryItems[0].id,
        type: 'IN',
        quantity: 800.00,
        projectId: null,
        reference: 'INV-2024-015',
        notes: 'Restocked from Empire Concrete Solutions',
        transactionDate: new Date('2024-01-20'),
      },
    }),
    prisma.inventoryTransaction.create({
      data: {
        companyId: company.id,
        itemId: inventoryItems[3].id,
        type: 'OUT',
        quantity: 8.00,
        projectId: projects[0].id,
        reference: 'PO-2024-045',
        notes: 'Electrical wire for MEP rough-in - floors 1-10',
        transactionDate: new Date('2024-02-20'),
      },
    }),
    prisma.inventoryTransaction.create({
      data: {
        companyId: company.id,
        itemId: inventoryItems[2].id,
        type: 'OUT',
        quantity: 35.00,
        projectId: projects[1].id,
        reference: 'PO-2024-067',
        notes: 'PVC pipes for plumbing installation - Building A',
        transactionDate: new Date('2024-04-10'),
      },
    }),
    prisma.inventoryTransaction.create({
      data: {
        companyId: company.id,
        itemId: inventoryItems[4].id,
        type: 'OUT',
        quantity: 1250.00,
        projectId: projects[6].id,
        reference: 'PO-2024-089',
        notes: 'Concrete blocks for exterior walls',
        transactionDate: new Date('2024-07-15'),
      },
    }),
    prisma.inventoryTransaction.create({
      data: {
        companyId: company.id,
        itemId: inventoryItems[5].id,
        type: 'OUT',
        quantity: 85.00,
        projectId: projects[3].id,
        reference: 'PO-2024-092',
        notes: 'Drywall for interior renovation',
        transactionDate: new Date('2024-05-20'),
      },
    }),
    prisma.inventoryTransaction.create({
      data: {
        companyId: company.id,
        itemId: inventoryItems[1].id,
        type: 'IN',
        quantity: 20.00,
        projectId: null,
        reference: 'INV-2024-128',
        notes: 'Rebar restock from Metro Steel',
        transactionDate: new Date('2024-08-05'),
      },
    }),
  ]);

  console.log(`✅ Created ${inventoryTransactions.length} inventory transactions`);

  // Create Tasks
  console.log('Creating tasks...');
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        companyId: company.id,
        projectId: projects[0].id,
        title: 'Schedule Final Building Inspection',
        description: 'Coordinate with DOB inspector for final building inspection. Ensure all systems are operational and documentation is complete.',
        status: 'In Progress',
        priority: 'High',
        dueDate: new Date('2025-07-15'),
        assignedTo: projectManager.id,
        position: 0,
        labels: 'Inspection,Final',
        estimatedHours: 8.00,
        actualHours: 0.00,
      },
    }),
    prisma.task.create({
      data: {
        companyId: company.id,
        projectId: projects[0].id,
        title: 'Order Elevator Equipment',
        description: 'Place order for elevator equipment and schedule delivery. Coordinate with elevator contractor for installation timeline.',
        status: 'To Do',
        priority: 'Medium',
        dueDate: new Date('2024-11-30'),
        assignedTo: estimator.id,
        position: 1,
        labels: 'Procurement,Elevator',
        estimatedHours: 4.00,
        actualHours: 0.00,
      },
    }),
    prisma.task.create({
      data: {
        companyId: company.id,
        projectId: projects[0].id,
        title: 'Review MEP Shop Drawings',
        description: 'Review and approve mechanical, electrical, and plumbing shop drawings. Coordinate with design team and subcontractors.',
        status: 'Review',
        priority: 'High',
        dueDate: new Date('2024-10-20'),
        assignedTo: projectManager.id,
        position: 2,
        labels: 'Review,MEP',
        estimatedHours: 12.00,
        actualHours: 8.00,
      },
    }),
    prisma.task.create({
      data: {
        companyId: company.id,
        projectId: projects[1].id,
        title: 'Obtain Environmental Permits',
        description: 'Submit applications for environmental permits required for residential development. Coordinate with DEC and local authorities.',
        status: 'In Progress',
        priority: 'High',
        dueDate: new Date('2024-05-31'),
        assignedTo: adminUser.id,
        position: 0,
        labels: 'Permits,Environmental',
        estimatedHours: 16.00,
        actualHours: 10.00,
      },
    }),
    prisma.task.create({
      data: {
        companyId: company.id,
        projectId: projects[1].id,
        title: 'Finalize Landscape Design',
        description: 'Work with landscape architect to finalize design. Coordinate plant selection and hardscape materials.',
        status: 'To Do',
        priority: 'Medium',
        dueDate: new Date('2025-01-15'),
        assignedTo: projectManager.id,
        position: 1,
        labels: 'Design,Landscaping',
        estimatedHours: 8.00,
        actualHours: 0.00,
      },
    }),
    prisma.task.create({
      data: {
        companyId: company.id,
        projectId: projects[2].id,
        title: 'Coordinate Phased Occupancy',
        description: 'Develop detailed phasing plan for hospital operations during construction. Ensure patient safety and minimal disruption.',
        status: 'In Progress',
        priority: 'Urgent',
        dueDate: new Date('2024-04-15'),
        assignedTo: siteSupervisor.id,
        position: 0,
        labels: 'Planning,Phasing',
        estimatedHours: 20.00,
        actualHours: 12.00,
      },
    }),
    prisma.task.create({
      data: {
        companyId: company.id,
        projectId: projects[3].id,
        title: 'Tenant Communication Plan',
        description: 'Develop communication plan for tenants during renovation. Schedule meetings and provide regular updates.',
        status: 'Done',
        priority: 'Medium',
        dueDate: new Date('2024-01-05'),
        assignedTo: projectManager.id,
        position: 0,
        labels: 'Communication,Tenants',
        estimatedHours: 6.00,
        actualHours: 5.50,
      },
    }),
    prisma.task.create({
      data: {
        companyId: company.id,
        projectId: projects[4].id,
        title: 'Site Survey and Geotechnical Report',
        description: 'Commission site survey and geotechnical investigation. Review soil conditions and foundation recommendations.',
        status: 'To Do',
        priority: 'High',
        dueDate: new Date('2024-06-30'),
        assignedTo: estimator.id,
        position: 0,
        labels: 'Survey,Geotechnical',
        estimatedHours: 10.00,
        actualHours: 0.00,
      },
    }),
    prisma.task.create({
      data: {
        companyId: company.id,
        projectId: projects[5].id,
        title: 'Final Punch List Completion',
        description: 'Complete final punch list items. Coordinate with subcontractors for remaining work items.',
        status: 'Done',
        priority: 'High',
        dueDate: new Date('2024-02-15'),
        assignedTo: siteSupervisor.id,
        position: 0,
        labels: 'Punch List,Final',
        estimatedHours: 16.00,
        actualHours: 14.50,
      },
    }),
    prisma.task.create({
      data: {
        companyId: company.id,
        projectId: null,
        title: 'Update Company Safety Manual',
        description: 'Review and update company safety manual with latest OSHA regulations and best practices.',
        status: 'To Do',
        priority: 'Medium',
        dueDate: new Date('2024-12-31'),
        assignedTo: adminUser.id,
        position: 0,
        labels: 'Safety,Documentation',
        estimatedHours: 12.00,
        actualHours: 0.00,
      },
    }),
  ]);

  console.log(`✅ Created ${tasks.length} tasks`);

  // Create Task Comments
  console.log('Creating task comments...');
  const taskComments = await Promise.all([
    prisma.taskComment.create({
      data: {
        taskId: tasks[0].id,
        userId: projectManager.id,
        content: 'DOB inspector contacted. Preliminary inspection scheduled for July 10th. All required documentation has been prepared.',
      },
    }),
    prisma.taskComment.create({
      data: {
        taskId: tasks[0].id,
        userId: adminUser.id,
        content: 'Excellent work on documentation. Make sure fire safety systems are fully tested before inspection.',
      },
    }),
    prisma.taskComment.create({
      data: {
        taskId: tasks[2].id,
        userId: projectManager.id,
        content: 'MEP shop drawings reviewed. Minor revisions requested from electrical subcontractor. Revised drawings expected by end of week.',
      },
    }),
    prisma.taskComment.create({
      data: {
        taskId: tasks[3].id,
        userId: adminUser.id,
        content: 'Environmental permit applications submitted. DEC review in progress. Expected approval within 4-6 weeks.',
      },
    }),
    prisma.taskComment.create({
      data: {
        taskId: tasks[5].id,
        userId: siteSupervisor.id,
        content: 'Phasing plan developed in coordination with hospital administration. Patient safety protocols established. Construction barriers installed.',
      },
    }),
    prisma.taskComment.create({
      data: {
        taskId: tasks[6].id,
        userId: projectManager.id,
        content: 'Tenant communication plan implemented. Monthly update meetings scheduled. All tenants notified of construction schedule.',
      },
    }),
  ]);

  console.log(`✅ Created ${taskComments.length} task comments`);

  // Create Task Activities
  console.log('Creating task activities...');
  const taskActivities = await Promise.all([
    prisma.taskActivity.create({
      data: {
        taskId: tasks[0].id,
        userId: projectManager.id,
        action: 'Task Started',
        details: 'Began coordination with DOB for final inspection',
      },
    }),
    prisma.taskActivity.create({
      data: {
        taskId: tasks[2].id,
        userId: projectManager.id,
        action: 'Status Changed',
        details: 'Changed status from In Progress to Review after initial review completed',
      },
    }),
    prisma.taskActivity.create({
      data: {
        taskId: tasks[6].id,
        userId: projectManager.id,
        action: 'Task Completed',
        details: 'Tenant communication plan successfully implemented and all meetings scheduled',
      },
    }),
    prisma.taskActivity.create({
      data: {
        taskId: tasks[8].id,
        userId: siteSupervisor.id,
        action: 'Task Completed',
        details: 'Final punch list completed. All items addressed and verified.',
      },
    }),
    prisma.taskActivity.create({
      data: {
        taskId: tasks[0].id,
        userId: adminUser.id,
        action: 'Comment Added',
        details: 'Added comment regarding fire safety systems',
      },
    }),
    prisma.taskActivity.create({
      data: {
        taskId: tasks[3].id,
        userId: adminUser.id,
        action: 'Status Changed',
        details: 'Changed status from To Do to In Progress when permit applications were submitted',
      },
    }),
  ]);

  console.log(`✅ Created ${taskActivities.length} task activities`);

  console.log('\n✨ Professional data seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - ${vendors.length} Vendors`);
  console.log(`   - ${projects.length} Projects`);
  console.log(`   - ${leads.length} Leads`);
  console.log(`   - ${payments.length} Payments`);
  console.log(`   - ${expenses.length} Expenses`);
  console.log(`   - ${siteProgresses.length} Site Progress entries`);
  console.log(`   - ${labours.length} Labour entries`);
  console.log(`   - ${documents.length} Documents`);
  console.log(`   - ${inventoryItems.length} Inventory Items`);
  console.log(`   - ${inventoryTransactions.length} Inventory Transactions`);
  console.log(`   - ${tasks.length} Tasks`);
  console.log(`   - ${taskComments.length} Task Comments`);
  console.log(`   - ${taskActivities.length} Task Activities`);
  console.log('\n🎉 Database seeded with professional construction data!\n');
  console.log('📧 Login Credentials:');
  console.log('   Admin: michael.chen@premierbuilders.com / Admin@2024');
  console.log('   PM: jennifer.martinez@premierbuilders.com / Admin@2024');
  console.log('   Supervisor: robert.williams@premierbuilders.com / Admin@2024');
  console.log('   Estimator: sarah.johnson@premierbuilders.com / Admin@2024\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
