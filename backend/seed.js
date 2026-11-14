const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Book = require('./models/Book');
const Membership = require('./models/Membership');
const BorrowRecord = require('./models/BorrowRecord');
const Fine = require('./models/Fine');
const Payment = require('./models/Payment');
const Notification = require('./models/Notification');
const Setting = require('./models/Setting');

const sampleBooks = [
  {
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    isbn: '978-0132350884',
    category: 'Computer Science',
    publisher: 'Prentice Hall',
    publicationYear: 2008,
    description: 'Even bad code can function. But if code isn’t clean, it can bring a development organization to its knees.',
    coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&q=80&w=600',
    totalCopies: 6,
    availableCopies: 4,
    shelfLocation: 'CS-Stack-A1',
  },
  {
    title: 'Introduction to Algorithms (CLRS)',
    author: 'Thomas H. Cormen, Charles E. Leiserson',
    isbn: '978-0262033848',
    category: 'Computer Science',
    publisher: 'MIT Press',
    publicationYear: 2009,
    description: 'Comprehensive update of the leading algorithms text, with new chapters on trees, algorithms in graphs, and multithreaded algorithms.',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600',
    totalCopies: 8,
    availableCopies: 5,
    shelfLocation: 'CS-Stack-A2',
  },
  {
    title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
    isbn: '978-0201633610',
    category: 'Computer Science',
    publisher: 'Addison-Wesley',
    publicationYear: 1994,
    description: 'Capturing a wealth of experience about the design of object-oriented software by four top designers.',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
    totalCopies: 5,
    availableCopies: 3,
    shelfLocation: 'CS-Stack-A3',
  },
  {
    title: 'Artificial Intelligence: A Modern Approach',
    author: 'Stuart Russell, Peter Norvig',
    isbn: '978-0136042594',
    category: 'Artificial Intelligence',
    publisher: 'Pearson',
    publicationYear: 2020,
    description: 'The authoritative, most widely used and accepted guide to the theory and practice of artificial intelligence.',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
    totalCopies: 7,
    availableCopies: 4,
    shelfLocation: 'AI-Lab-B1',
  },
  {
    title: 'Deep Learning',
    author: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville',
    isbn: '978-0262035613',
    category: 'Artificial Intelligence',
    publisher: 'MIT Press',
    publicationYear: 2016,
    description: 'An introduction to a broad range of topics in deep learning, covering mathematical and conceptual background.',
    coverImage: 'https://images.unsplash.com/photo-1507842229451-79b1be8d6290?auto=format&fit=crop&q=80&w=600',
    totalCopies: 5,
    availableCopies: 3,
    shelfLocation: 'AI-Lab-B2',
  },
  {
    title: 'Database System Concepts',
    author: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan',
    isbn: '978-0078022159',
    category: 'Computer Science',
    publisher: 'McGraw-Hill',
    publicationYear: 2019,
    description: 'Presents the fundamental concepts of database management in an intuitive manner geared toward student education.',
    coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600',
    totalCopies: 6,
    availableCopies: 5,
    shelfLocation: 'CS-Stack-B1',
  },
  {
    title: 'Computer Networking: A Top-Down Approach',
    author: 'James F. Kurose, Keith W. Ross',
    isbn: '978-0133594140',
    category: 'Computer Science',
    publisher: 'Pearson',
    publicationYear: 2021,
    description: 'Focuses on the Internet and the fundamentally important issues of networking with a top-down pedagogy.',
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600',
    totalCopies: 5,
    availableCopies: 4,
    shelfLocation: 'CS-Stack-C1',
  },
  {
    title: 'Modern Operating Systems',
    author: 'Andrew S. Tanenbaum, Herbert Bos',
    isbn: '978-0133591620',
    category: 'Computer Science',
    publisher: 'Pearson',
    publicationYear: 2014,
    description: 'Widely praised for its clear explanations of operating systems design and modern implementation issues.',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600',
    totalCopies: 6,
    availableCopies: 3,
    shelfLocation: 'CS-Stack-C2',
  },
  {
    title: 'Python for Data Analysis',
    author: 'Wes McKinney',
    isbn: '978-1491957660',
    category: 'Data Science',
    publisher: "O'Reilly Media",
    publicationYear: 2022,
    description: 'Data wrangling with Pandas, NumPy, and Jupyter notebooks from the creator of the Python pandas project.',
    coverImage: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&q=80&w=600',
    totalCopies: 7,
    availableCopies: 5,
    shelfLocation: 'DS-Stack-D1',
  },
  {
    title: 'Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow',
    author: 'Aurélien Géron',
    isbn: '978-1492032649',
    category: 'Data Science',
    publisher: "O'Reilly Media",
    publicationYear: 2019,
    description: 'Through concrete examples, minimal theory, and two production-ready Python frameworks, learn concepts intuitively.',
    coverImage: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=600',
    totalCopies: 5,
    availableCopies: 3,
    shelfLocation: 'DS-Stack-D2',
  },
  {
    title: 'Higher Engineering Mathematics',
    author: 'B.S. Grewal',
    isbn: '978-8174091955',
    category: 'Mathematics',
    publisher: 'Khanna Publishers',
    publicationYear: 2017,
    description: 'Comprehensive textbook covering calculus, linear algebra, complex analysis, and differential equations.',
    coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=600',
    totalCopies: 10,
    availableCopies: 7,
    shelfLocation: 'MATH-Stack-E1',
  },
  {
    title: 'Linear Algebra and Its Applications',
    author: 'Gilbert Strang',
    isbn: '978-0030105678',
    category: 'Mathematics',
    publisher: 'Cengage Learning',
    publicationYear: 2016,
    description: 'Renowned professor and educator Gilbert Strang demystifies vectors, eigenvalues, and matrix decomposition.',
    coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=600',
    totalCopies: 6,
    availableCopies: 4,
    shelfLocation: 'MATH-Stack-E2',
  },
  {
    title: 'Concepts of Physics (Vol 1 & 2)',
    author: 'H.C. Verma',
    isbn: '978-8177091878',
    category: 'Physics',
    publisher: 'Bharati Bhawan',
    publicationYear: 2015,
    description: 'Foundational college and competitive physics curriculum covering mechanics, waves, optics, and thermodynamics.',
    coverImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=600',
    totalCopies: 8,
    availableCopies: 6,
    shelfLocation: 'PHYS-Stack-F1',
  },
  {
    title: 'Fundamentals of Physics',
    author: 'David Halliday, Robert Resnick, Jearl Walker',
    isbn: '978-1118230718',
    category: 'Physics',
    publisher: 'Wiley',
    publicationYear: 2018,
    description: 'The standard physics text offering a solid understanding of fundamental physics concepts and problem solving.',
    coverImage: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=600',
    totalCopies: 5,
    availableCopies: 4,
    shelfLocation: 'PHYS-Stack-F2',
  },
  {
    title: 'Principles of Economics',
    author: 'N. Gregory Mankiw',
    isbn: '978-1305585126',
    category: 'Business & Economics',
    publisher: 'Cengage',
    publicationYear: 2020,
    description: 'The most popular introductory economics text, emphasizing economic principles applied to real life policies.',
    coverImage: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=600',
    totalCopies: 5,
    availableCopies: 4,
    shelfLocation: 'BUS-Stack-G1',
  },
  {
    title: 'Financial Management: Theory and Practice',
    author: 'Prasanna Chandra',
    isbn: '978-9353166526',
    category: 'Business & Economics',
    publisher: 'McGraw Hill',
    publicationYear: 2019,
    description: 'Focuses on financial decision-making in corporations with Indian business case studies and models.',
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600',
    totalCopies: 4,
    availableCopies: 3,
    shelfLocation: 'BUS-Stack-G2',
  },
  {
    title: 'Electronic Devices and Circuit Theory',
    author: 'Robert L. Boylestad, Louis Nashelsky',
    isbn: '978-0132622264',
    category: 'Electronics',
    publisher: 'Pearson',
    publicationYear: 2013,
    description: 'Standard textbook for electronic circuits, semiconductors, diodes, transistors, and amplification systems.',
    coverImage: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&q=80&w=600',
    totalCopies: 5,
    availableCopies: 4,
    shelfLocation: 'ELEC-Stack-H1',
  },
  {
    title: 'Microelectronic Circuits',
    author: 'Adel S. Sedra, Kenneth C. Smith',
    isbn: '978-0199339136',
    category: 'Electronics',
    publisher: 'Oxford University Press',
    publicationYear: 2014,
    description: 'Thorough, up-to-date presentation of the fundamentals of electronic circuit design and analysis.',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600',
    totalCopies: 4,
    availableCopies: 3,
    shelfLocation: 'ELEC-Stack-H2',
  },
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '978-0060935467',
    category: 'Literature',
    publisher: 'Harper Perennial Modern Classics',
    publicationYear: 2002,
    description: 'A gripping, heart-wrenching, and wholly remarkable tale of coming-of-age in a South poisoned by virulent prejudice.',
    coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600',
    totalCopies: 6,
    availableCopies: 5,
    shelfLocation: 'LIT-Stack-I1',
  },
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0743273565',
    category: 'Literature',
    publisher: 'Scribner',
    publicationYear: 2004,
    description: 'The exemplary novel of the Jazz Age, exploring themes of decadence, idealism, and social upheaval in 1920s America.',
    coverImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=600',
    totalCopies: 5,
    availableCopies: 4,
    shelfLocation: 'LIT-Stack-I2',
  },
];

const sampleStudents = [
  {
    name: 'Rahul Sharma',
    email: 'rahul.sharma@college.edu',
    phone: '+91 98765 43210',
    address: 'Boys Hostel 3, Room 204, Campus East',
    plan: 'Annual',
  },
  {
    name: 'Priya Patel',
    email: 'priya.patel@college.edu',
    phone: '+91 98765 43211',
    address: 'Girls Hostel 1, Room 112, Campus West',
    plan: 'Annual',
  },
  {
    name: 'Amit Kumar',
    email: 'amit.kumar@college.edu',
    phone: '+91 98765 43212',
    address: 'Block B, Faculty Enclave, College Town',
    plan: 'Quarterly',
  },
  {
    name: 'Sneha Reddy',
    email: 'sneha.reddy@college.edu',
    phone: '+91 98765 43213',
    address: 'PG Accommodation, 4th Cross, Green Garden',
    plan: 'Annual',
  },
  {
    name: 'Arjun Verma',
    email: 'arjun.verma@college.edu',
    phone: '+91 98765 43214',
    address: 'Boys Hostel 2, Room 301, Campus East',
    plan: 'Monthly',
  },
  {
    name: 'Ananya Singh',
    email: 'ananya.singh@college.edu',
    phone: '+91 98765 43215',
    address: 'Girls Hostel 2, Room 405, Campus West',
    plan: 'Annual',
  },
  {
    name: 'Rohit Mehta',
    email: 'rohit.mehta@college.edu',
    phone: '+91 98765 43216',
    address: 'Flat 302, Sunrise Apartments, College Road',
    plan: 'Quarterly',
  },
  {
    name: 'Pooja Nair',
    email: 'pooja.nair@college.edu',
    phone: '+91 98765 43217',
    address: 'Girls Hostel 1, Room 220, Campus West',
    plan: 'Annual',
  },
  {
    name: 'Vikram Joshi',
    email: 'vikram.joshi@college.edu',
    phone: '+91 98765 43218',
    address: 'Boys Hostel 1, Room 108, Campus East',
    plan: 'Monthly',
  },
  {
    name: 'Kavita Sen',
    email: 'kavita.sen@college.edu',
    phone: '+91 98765 43219',
    address: 'Sector 5, University Staff Quarters',
    plan: 'Annual',
  },
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/library_management_db';
    console.log(`Connecting to MongoDB at: ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully.');

    // Clear existing collections
    console.log('Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Book.deleteMany({}),
      Membership.deleteMany({}),
      BorrowRecord.deleteMany({}),
      Fine.deleteMany({}),
      Payment.deleteMany({}),
      Notification.deleteMany({}),
      Setting.deleteMany({}),
    ]);
    console.log('All existing collections cleared.');

    // 1. Initialize Settings
    console.log('Initializing system settings...');
    await Setting.create([
      {
        key: 'DEFAULT_FINE_PER_DAY',
        value: 5,
        description: 'Default fine rate charged per overdue day (INR)',
      },
      {
        key: 'DEFAULT_BORROW_DAYS',
        value: 14,
        description: 'Standard borrowing duration in days',
      },
    ]);

    // 2. Create Admin Account
    console.log('Creating Admin account...');
    const adminUser = await User.create({
      name: 'Central Library Administrator',
      email: 'admin@college.edu',
      password: 'Admin@123',
      role: 'admin',
      phone: '+91 99000 11223',
    });
    console.log(`Admin created: ${adminUser.email} / Admin@123`);

    // 3. Insert 20 Sample Books
    console.log('Inserting 20 sample library books...');
    const books = await Book.insertMany(sampleBooks);
    console.log(`Inserted ${books.length} books across diverse college curriculum subjects.`);

    // 4. Create 10 Student accounts & Memberships
    console.log('Creating 10 student accounts and memberships...');
    const studentUsers = [];
    const memberships = [];

    const now = new Date();

    for (let i = 0; i < sampleStudents.length; i++) {
      const data = sampleStudents[i];
      const studentUser = await User.create({
        name: data.name,
        email: data.email,
        password: 'Student@123',
        role: 'student',
        phone: data.phone,
      });

      const memberId = `LIB-${now.getFullYear()}-${String(i + 1).padStart(4, '0')}`;
      let planDays = 365;
      if (data.plan === 'Monthly') planDays = 30;
      if (data.plan === 'Quarterly') planDays = 90;

      // Make member #8 expired for realistic dashboard alerts
      const isExpired = i === 7;
      const startDate = isExpired
        ? new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000)
        : new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000);
      const expiryDate = isExpired
        ? new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000)
        : new Date(startDate.getTime() + planDays * 24 * 60 * 60 * 1000);

      const membership = await Membership.create({
        memberId,
        user: studentUser._id,
        fullName: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        plan: data.plan,
        registrationDate: startDate,
        startDate,
        expiryDate,
        status: isExpired ? 'Expired' : 'Active',
      });

      studentUser.membership = membership._id;
      await studentUser.save();

      studentUsers.push(studentUser);
      memberships.push(membership);
    }
    console.log(`Created ${memberships.length} memberships.`);

    // 5. Create Realistic Borrowing Records
    console.log('Creating borrowing records, fines, and payment histories...');
    // Borrow Record 1: Rahul Sharma - Clean Code (Currently Issued, Due in 5 days)
    const rec1 = await BorrowRecord.create({
      transactionId: `TXN-${now.getFullYear()}-0101`,
      member: memberships[0]._id,
      book: books[0]._id,
      issueDate: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000),
      dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      status: 'Issued',
      issuedBy: adminUser._id,
    });

    // Borrow Record 2: Priya Patel - CLRS Algorithms (Due in 2 days - Due Soon)
    const rec2 = await BorrowRecord.create({
      transactionId: `TXN-${now.getFullYear()}-0102`,
      member: memberships[1]._id,
      book: books[1]._id,
      issueDate: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
      dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      status: 'Issued',
      issuedBy: adminUser._id,
    });

    // Borrow Record 3: Amit Kumar - AI Modern Approach (Due Today)
    const rec3 = await BorrowRecord.create({
      transactionId: `TXN-${now.getFullYear()}-0103`,
      member: memberships[2]._id,
      book: books[3]._id,
      issueDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0, 0),
      status: 'Issued',
      issuedBy: adminUser._id,
    });

    // Borrow Record 4: Sneha Reddy - Deep Learning (Overdue by 6 days, Pending Fine)
    const rec4DueDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    const rec4 = await BorrowRecord.create({
      transactionId: `TXN-${now.getFullYear()}-0104`,
      member: memberships[3]._id,
      book: books[4]._id,
      issueDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      dueDate: rec4DueDate,
      status: 'Overdue',
      issuedBy: adminUser._id,
    });

    // Create Fine for Sneha (6 days * 5 = ₹30 Pending)
    const fine4 = await Fine.create({
      borrowRecord: rec4._id,
      member: memberships[3]._id,
      book: books[4]._id,
      overdueDays: 6,
      finePerDay: 5,
      totalAmount: 30,
      amountPaid: 0,
      balanceAmount: 30,
      status: 'Pending',
    });
    rec4.fine = fine4._id;
    await rec4.save();

    // Borrow Record 5: Arjun Verma - Modern Operating Systems (Returned late, Fine Paid via UPI)
    const rec5DueDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
    const rec5ReturnDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 8 days late
    const rec5 = await BorrowRecord.create({
      transactionId: `TXN-${now.getFullYear()}-0105`,
      member: memberships[4]._id,
      book: books[7]._id,
      issueDate: new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000),
      dueDate: rec5DueDate,
      returnDate: rec5ReturnDate,
      status: 'Returned',
      issuedBy: adminUser._id,
    });

    const fine5 = await Fine.create({
      borrowRecord: rec5._id,
      member: memberships[4]._id,
      book: books[7]._id,
      overdueDays: 8,
      finePerDay: 5,
      totalAmount: 40,
      amountPaid: 40,
      balanceAmount: 0,
      status: 'Paid',
    });
    rec5.fine = fine5._id;
    await rec5.save();

    // Payment for Arjun Verma
    await Payment.create({
      receiptNumber: `RCP-${now.getFullYear()}-8001`,
      transactionReference: 'DEMO-UPI-984321',
      fine: fine5._id,
      member: memberships[4]._id,
      amount: 40,
      paymentMethod: 'UPI',
      paymentStatus: 'Completed',
      paymentDate: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      notes: 'Demo Google Pay / PhonePe simulation',
    });

    // Borrow Record 6: Ananya Singh - Higher Engineering Mathematics (Returned late, Fine Waived by Admin)
    const rec6DueDate = new Date(now.getTime() - 22 * 24 * 60 * 60 * 1000);
    const rec6ReturnDate = new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000); // 4 days late
    const rec6 = await BorrowRecord.create({
      transactionId: `TXN-${now.getFullYear()}-0106`,
      member: memberships[5]._id,
      book: books[10]._id,
      issueDate: new Date(now.getTime() - 36 * 24 * 60 * 60 * 1000),
      dueDate: rec6DueDate,
      returnDate: rec6ReturnDate,
      status: 'Returned',
      issuedBy: adminUser._id,
    });

    const fine6 = await Fine.create({
      borrowRecord: rec6._id,
      member: memberships[5]._id,
      book: books[10]._id,
      overdueDays: 4,
      finePerDay: 5,
      totalAmount: 20,
      amountPaid: 0,
      balanceAmount: 0,
      status: 'Waived',
      waivedReason: 'Medical absence verified by college dispensary certificate',
      waivedAt: new Date(now.getTime() - 17 * 24 * 60 * 60 * 1000),
      waivedBy: adminUser._id,
    });
    rec6.fine = fine6._id;
    await rec6.save();

    // Borrow Record 7: Rohit Mehta - Hands-On ML (Returned on time, 0 fine)
    await BorrowRecord.create({
      transactionId: `TXN-${now.getFullYear()}-0107`,
      member: memberships[6]._id,
      book: books[9]._id,
      issueDate: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      dueDate: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000),
      returnDate: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
      status: 'Returned',
      issuedBy: adminUser._id,
    });

    // Borrow Record 8: Rahul Sharma - Design Patterns (Returned late, Paid via Card)
    const rec8DueDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const rec8ReturnDate = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000); // 10 days late = ₹50
    const rec8 = await BorrowRecord.create({
      transactionId: `TXN-${now.getFullYear()}-0108`,
      member: memberships[0]._id,
      book: books[2]._id,
      issueDate: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000),
      dueDate: rec8DueDate,
      returnDate: rec8ReturnDate,
      status: 'Returned',
      issuedBy: adminUser._id,
    });

    const fine8 = await Fine.create({
      borrowRecord: rec8._id,
      member: memberships[0]._id,
      book: books[2]._id,
      overdueDays: 10,
      finePerDay: 5,
      totalAmount: 50,
      amountPaid: 50,
      balanceAmount: 0,
      status: 'Paid',
    });
    rec8.fine = fine8._id;
    await rec8.save();

    await Payment.create({
      receiptNumber: `RCP-${now.getFullYear()}-8002`,
      transactionReference: 'DEMO-CARD-77312',
      fine: fine8._id,
      member: memberships[0]._id,
      amount: 50,
      paymentMethod: 'Card',
      paymentStatus: 'Completed',
      paymentDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      notes: 'Demo Visa Card payment simulation',
    });

    // Notifications for Rahul Sharma
    await Notification.create([
      {
        user: studentUsers[0]._id,
        member: memberships[0]._id,
        borrowRecord: rec1._id,
        title: 'Book Issued Successfully',
        message: 'You have borrowed "Clean Code". Due date: in 5 days.',
        type: 'General',
        read: false,
      },
      {
        user: studentUsers[0]._id,
        member: memberships[0]._id,
        title: 'Fine Payment Receipt',
        message: 'Payment of ₹50 received for "Design Patterns". Receipt #RCP-2026-8002',
        type: 'Payment',
        read: true,
      },
      {
        user: studentUsers[3]._id,
        member: memberships[3]._id,
        borrowRecord: rec4._id,
        title: 'URGENT: Overdue Library Book Alert',
        message: 'Your borrowed book "Deep Learning" is overdue by 6 days. Fine accumulating at ₹5/day.',
        type: 'Overdue',
        read: false,
      },
    ]);

    console.log('Seeding completed successfully!');
    console.log('\n=============================================');
    console.log('DEMO CREDENTIALS:');
    console.log('Admin Login:');
    console.log('  Email:    admin@college.edu');
    console.log('  Password: Admin@123');
    console.log('Student Login:');
    console.log('  Email:    rahul.sharma@college.edu');
    console.log('  Password: Student@123');
    console.log('  (Other student emails: priya.patel@college.edu, sneha.reddy@college.edu, etc.)');
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
