import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Company } from '../models/Company';
import { Job } from '../models/Job';
import { StudentProfile } from '../models/StudentProfile';
import { PlacementDrive } from '../models/PlacementDrive';
import { Application } from '../models/Application';
import { Offer } from '../models/Offer';

dotenv.config();

const clearDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  console.log('🗑️ Database cleared');
};

const seed = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found');
    }
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    await clearDB();

    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('Password123!', salt);

    // Create Users
    console.log('👤 Seeding Users...');
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@placement.com',
        password: defaultPassword,
        role: 'admin',
        isEmailVerified: true,
        isActive: true,
        isApproved: true,
        preferences: { theme: 'dark', emailNotifications: true, pushNotifications: true, language: 'en' }
      },
      {
        name: 'Jane Placement Officer',
        email: 'po@placement.com',
        password: defaultPassword,
        role: 'placement_officer',
        isEmailVerified: true,
        isActive: true,
        isApproved: true,
        preferences: { theme: 'light', emailNotifications: true, pushNotifications: true, language: 'en' }
      },
      {
        name: 'John Student',
        email: 'student@placement.com',
        password: defaultPassword,
        role: 'student',
        isEmailVerified: true,
        isActive: true,
        isApproved: true,
        phone: '+919999999999',
        preferences: { theme: 'dark', emailNotifications: true, pushNotifications: true, language: 'en' }
      },
      {
        name: 'Alice Student',
        email: 'alice@placement.com',
        password: defaultPassword,
        role: 'student',
        isEmailVerified: true,
        isActive: true,
        isApproved: true,
        phone: '+918888888888',
        preferences: { theme: 'light', emailNotifications: true, pushNotifications: true, language: 'en' }
      },
      {
        name: 'HR Recruiter (Vercel)',
        email: 'recruiter@vercel.com',
        password: defaultPassword,
        role: 'recruiter',
        isEmailVerified: true,
        isActive: true,
        isApproved: true,
        phone: '+917777777777',
        preferences: { theme: 'dark', emailNotifications: true, pushNotifications: true, language: 'en' }
      },
      {
        name: 'HR Recruiter (Stripe)',
        email: 'recruiter@stripe.com',
        password: defaultPassword,
        role: 'recruiter',
        isEmailVerified: true,
        isActive: true,
        isApproved: true,
        phone: '+916666666666',
        preferences: { theme: 'light', emailNotifications: true, pushNotifications: true, language: 'en' }
      }
    ]);

    const admin = users[0];
    const po = users[1];
    const student1 = users[2];
    const student2 = users[3];
    const recVercel = users[4];
    const recStripe = users[5];

    // Create Companies
    console.log('🏢 Seeding Companies...');
    const companies = await Company.create([
      {
        name: 'Vercel',
        slug: 'vercel',
        website: 'https://vercel.com',
        description: 'Vercel provides developer tools and cloud infrastructure to build, deploy, and scale frontend web applications instantly.',
        industry: 'Cloud Computing & Developer Tools',
        companySize: '501-1000',
        founded: 2015,
        headquarters: 'San Francisco, CA',
        locations: ['Remote', 'San Francisco', 'New York'],
        techStack: ['React', 'Next.js', 'TypeScript', 'Node.js', 'AWS'],
        perks: ['Remote Work Stipend', 'Health Insurance', 'Unlimited PTO', 'Equity'],
        isVerified: true,
        isActive: true,
        createdBy: recVercel._id,
        recruiters: [recVercel._id]
      },
      {
        name: 'Stripe',
        slug: 'stripe',
        website: 'https://stripe.com',
        description: 'Stripe is a suite of APIs powering online payment processing and commerce solutions for businesses of all sizes.',
        industry: 'FinTech',
        companySize: '5000+',
        founded: 2010,
        headquarters: 'San Francisco, CA',
        locations: ['San Francisco', 'Dublin', 'Remote', 'Bengaluru'],
        techStack: ['Ruby on Rails', 'Scala', 'Go', 'React', 'TypeScript'],
        perks: ['Gym Membership', 'Catered Meals', 'Stock Options', 'Comprehensive Medical'],
        isVerified: true,
        isActive: true,
        createdBy: recStripe._id,
        recruiters: [recStripe._id]
      }
    ]);

    const vercelCompany = companies[0];
    const stripeCompany = companies[1];

    // Create Student Profiles
    console.log('🎓 Seeding Student Profiles...');
    await StudentProfile.create([
      {
        user: student1._id,
        rollNumber: 'CS2026001',
        department: 'Computer Science',
        branch: 'Software Engineering',
        semester: 7,
        year: 4,
        graduationYear: 2026,
        cgpa: 9.2,
        backlogs: 0,
        activeBacklogs: 0,
        tenthPercentage: 95.0,
        twelfthPercentage: 93.6,
        college: 'Institute of Technology',
        university: 'State Technical University',
        skills: [
          { name: 'React', level: 'advanced', endorsements: 10 },
          { name: 'TypeScript', level: 'advanced', endorsements: 8 },
          { name: 'Node.js', level: 'intermediate', endorsements: 5 },
          { name: 'MongoDB', level: 'intermediate', endorsements: 4 }
        ],
        experience: [
          {
            title: 'Frontend Intern',
            company: 'Framer',
            type: 'internship',
            startDate: new Date('2025-05-01'),
            endDate: new Date('2025-08-01'),
            isCurrent: false,
            description: 'Worked on Framer canvas performance improvements and React 19 testing templates.',
            skills: ['React', 'TypeScript', 'Framer Motion']
          }
        ],
        projects: [
          {
            name: 'Linear Clone',
            description: 'A beautiful keyboard-driven issue tracker with Tailwind CSS, Next.js, and tRPC.',
            technologies: ['Next.js', 'Tailwind CSS', 'tRPC', 'Prisma'],
            githubUrl: 'https://github.com/johnstudent/linear-clone'
          }
        ],
        bio: 'Aspiring frontend engineer passionate about design systems, premium UI/UX, and reactive applications.',
        headline: 'Computer Science Undergrad | React & Next.js Specialist',
        location: 'Bengaluru, India',
        isAvailableForPlacement: true,
        placementStatus: 'not_placed',
        profileCompletion: 90
      },
      {
        user: student2._id,
        rollNumber: 'CS2026002',
        department: 'Computer Science',
        branch: 'Data Science',
        semester: 7,
        year: 4,
        graduationYear: 2026,
        cgpa: 8.7,
        backlogs: 0,
        activeBacklogs: 0,
        tenthPercentage: 91.2,
        twelfthPercentage: 89.8,
        college: 'Institute of Technology',
        university: 'State Technical University',
        skills: [
          { name: 'Python', level: 'advanced', endorsements: 12 },
          { name: 'SQL', level: 'advanced', endorsements: 9 },
          { name: 'Machine Learning', level: 'intermediate', endorsements: 7 },
          { name: 'Pandas', level: 'advanced', endorsements: 8 }
        ],
        projects: [
          {
            name: 'ATS Keyword Analyzer',
            description: 'An AI-powered tool to identify missing keywords in resumes relative to job descriptions.',
            technologies: ['Python', 'FastAPI', 'scikit-learn'],
            githubUrl: 'https://github.com/alice/ats-analyzer'
          }
        ],
        bio: 'Passionate about data-driven decisions, machine learning systems, and pipeline automation.',
        headline: 'Data Science Major | Python & ML Developer',
        location: 'Mumbai, India',
        isAvailableForPlacement: true,
        placementStatus: 'not_placed',
        profileCompletion: 85
      }
    ]);

    // Create Jobs
    console.log('💼 Seeding Jobs...');
    const jobs = await Job.create([
      {
        title: 'Frontend Engineer (Next.js)',
        company: vercelCompany._id,
        postedBy: recVercel._id,
        description: 'Join the Vercel team to build the future of the web. You will work on Vercel Dashboard, design systems, and collaborate on frameworks.',
        responsibilities: [
          'Build responsive, premium dashboards with React and Tailwind CSS.',
          'Optimize web performance, Core Web Vitals, and server rendering patterns.',
          'Develop reusable components using Framer Motion for rich experiences.'
        ],
        requirements: [
          'Excellent understanding of React, TypeScript, and semantic HTML.',
          'Experience building design systems and modular CSS.',
          'Solid understanding of HTTP caching, CDNs, and Next.js.'
        ],
        skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
        type: 'full-time',
        workMode: 'remote',
        location: 'San Francisco, CA (Remote)',
        salary: {
          min: 1800000,
          max: 3000000,
          currency: 'INR',
          period: 'annual',
          isNegotiable: true,
          isDisclosed: true
        },
        experience: { min: 0, max: 2 },
        eligibility: {
          minCGPA: 8.5,
          branches: ['Software Engineering', 'Computer Science'],
          graduationYear: [2026]
        },
        openings: 5,
        category: 'Software Engineering',
        tags: ['Frontend', 'React', 'Remote'],
        isCampusHiring: true,
        status: 'published',
        publishedAt: new Date()
      },
      {
        title: 'Software Engineer - Payments core',
        company: stripeCompany._id,
        postedBy: recStripe._id,
        description: 'Stripe is looking for a backend engineer to design scalable billing engines. You will work on robust APIs handling millions of global operations.',
        responsibilities: [
          'Design secure APIs with robust transaction protection.',
          'Scale backend databases and build reliable caching layers.',
          'Write extensive integration tests and secure billing pipelines.'
        ],
        requirements: [
          'Proficiency in any backend language (Node.js, Go, Python, Ruby).',
          'Deep knowledge of SQL databases, transaction isolation levels, and concurrency.',
          'Understanding of rate-limiting, CORS, and JWT authentication.'
        ],
        skills: ['Node.js', 'Go', 'SQL', 'Redis', 'API Design'],
        type: 'full-time',
        workMode: 'hybrid',
        location: 'Bengaluru, India',
        salary: {
          min: 2200000,
          max: 3500000,
          currency: 'INR',
          period: 'annual',
          isNegotiable: false,
          isDisclosed: true
        },
        experience: { min: 0, max: 3 },
        eligibility: {
          minCGPA: 8.0,
          branches: ['Computer Science', 'Information Technology'],
          graduationYear: [2026]
        },
        openings: 3,
        category: 'Software Engineering',
        tags: ['Backend', 'FinTech', 'Hybrid'],
        isCampusHiring: true,
        status: 'published',
        publishedAt: new Date()
      }
    ]);

    const vercelJob = jobs[0];
    const stripeJob = jobs[1];

    // Create Placement Drives
    console.log('🚀 Seeding Placement Drives...');
    await PlacementDrive.create([
      {
        title: 'Vercel Virtual Campus Recruitment Drive 2026',
        description: 'A 2-day virtual recruitment sprint targeting high-potential software engineers.',
        company: vercelCompany._id,
        jobs: [vercelJob._id],
        organizedBy: po._id,
        eligibility: {
          minCGPA: 8.5,
          branches: ['Software Engineering', 'Computer Science'],
          graduationYear: [2026]
        },
        schedule: {
          registrationStart: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          registrationEnd: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),   // 5 days from now
          driveDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)         // 10 days from now
        },
        mode: 'virtual',
        venue: 'Google Meet',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        maxRegistrations: 100,
        registeredStudents: [student1._id],
        status: 'registration_open',
        isPublished: true,
        rounds: [
          { name: 'Coding Challenge', type: 'coding', date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), duration: 120 },
          { name: 'Technical Round 1', type: 'technical', date: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000) },
          { name: 'HR / Culture Fit', type: 'hr', date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000) }
        ]
      }
    ]);

    console.log('🚀 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seed();
