import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create default test account (required)
  const defaultPassword = await bcrypt.hash('johndoe123', 12)
  const defaultUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: defaultPassword,
      name: 'John Doe',
      role: "Teacher"
    }
  })
  console.log('Created default test account')

  // Create teacher accounts
  const teacherPassword = await bcrypt.hash('teacher123', 12)
  const teacher1 = await prisma.user.upsert({
    where: { email: 'teacher@sahayak.com' },
    update: {},
    create: {
      email: 'teacher@sahayak.com',
      password: teacherPassword,
      name: 'Dr. Sarah Mitchell',
      role: "Teacher"
    }
  })

  const teacher2 = await prisma.user.upsert({
    where: { email: 'david.chen@sahayak.com' },
    update: {},
    create: {
      email: 'david.chen@sahayak.com',
      password: teacherPassword,
      name: 'Prof. David Chen',
      role: "Teacher"
    }
  })
  console.log('Created teacher accounts')

  // Create student accounts
  const studentPassword = await bcrypt.hash('student123', 12)
  const student1 = await prisma.user.upsert({
    where: { email: 'student@sahayak.com' },
    update: {},
    create: {
      email: 'student@sahayak.com',
      password: studentPassword,
      name: 'Emma Wilson',
      role: "Student"
    }
  })

  const student2 = await prisma.user.upsert({
    where: { email: 'alex.kumar@sahayak.com' },
    update: {},
    create: {
      email: 'alex.kumar@sahayak.com',
      password: studentPassword,
      name: 'Alex Kumar',
      role: "Student"
    }
  })
  console.log('Created student accounts')

  // Create sample lessons
  const lesson1 = await prisma.lesson.upsert({
    where: { id: 'lesson-algebra-1' },
    update: {},
    create: {
      id: 'lesson-algebra-1',
      title: 'Introduction to Algebra',
      subject: 'Mathematics',
      description: 'Learn the fundamental concepts of algebra including variables, expressions, and equations.',
      content: `# Introduction to Algebra

## What is Algebra?
Algebra is a branch of mathematics that uses symbols (usually letters) to represent numbers in equations and formulas. These symbols are called variables.

## Key Concepts

### Variables
A variable is a symbol, usually a letter, that represents a number we don't know yet. For example, in the expression x + 5, x is a variable.

### Expressions
An algebraic expression is a combination of numbers, variables, and operations. Examples:
- 3x + 2
- 2y - 5
- 4a + 3b - 7

### Equations
An equation is a mathematical statement that two expressions are equal. It contains an equals sign (=).
Example: 2x + 3 = 11

## Solving Simple Equations

To solve an equation means to find the value of the variable that makes the equation true.

Example: Solve 2x + 3 = 11

Step 1: Subtract 3 from both sides
2x + 3 - 3 = 11 - 3
2x = 8

Step 2: Divide both sides by 2
2x ÷ 2 = 8 ÷ 2
x = 4

Verification: 2(4) + 3 = 8 + 3 = 11 ✓

## Practice Problems
1. Solve: x + 7 = 12
2. Solve: 3y = 15
3. Solve: 4a - 2 = 10

## Important Rules
- Whatever you do to one side of an equation, you must do to the other side
- The goal is to isolate the variable on one side of the equation
- Always check your answer by substituting it back into the original equation`,
      teacherId: teacher1.id
    }
  })

  const lesson2 = await prisma.lesson.upsert({
    where: { id: 'lesson-cell-biology' },
    update: {},
    create: {
      id: 'lesson-cell-biology',
      title: 'Cell Structure and Function',
      subject: 'Biology',
      description: 'Explore the basic unit of life - the cell, its structure, and how different parts work together.',
      content: `# Cell Structure and Function

## What is a Cell?
A cell is the smallest unit of life that can function independently. All living organisms are made up of one or more cells.

## Types of Cells

### Prokaryotic Cells
- Simple structure
- No nucleus
- Found in bacteria
- DNA floats freely in the cytoplasm

### Eukaryotic Cells
- Complex structure
- Have a nucleus
- Found in animals, plants, fungi
- DNA enclosed in nucleus

## Major Cell Structures

### Cell Membrane
- Outer boundary of the cell
- Controls what enters and exits
- Made of phospholipids and proteins

### Nucleus
- Control center of the cell
- Contains DNA (genetic material)
- Surrounded by nuclear membrane

### Cytoplasm
- Gel-like substance inside cell
- Contains organelles
- Site of many chemical reactions

### Mitochondria
- Powerhouse of the cell
- Produces energy (ATP)
- Has its own DNA

### Ribosomes
- Protein factories
- Can be free or attached to ER
- Made of RNA and proteins

### Endoplasmic Reticulum (ER)
- Network of membranes
- Rough ER: has ribosomes, makes proteins
- Smooth ER: makes lipids

### Golgi Apparatus
- Packaging and shipping center
- Modifies and packages proteins
- Sends them to destinations

## Plant Cell Special Structures

### Cell Wall
- Rigid outer layer
- Provides support and protection
- Made of cellulose

### Chloroplasts
- Site of photosynthesis
- Contains chlorophyll (green pigment)
- Converts light energy to food

### Large Central Vacuole
- Storage organelle
- Stores water and nutrients
- Helps maintain cell shape

## Key Concepts to Remember
1. All living things are made of cells
2. Cells are the basic unit of structure and function
3. All cells come from pre-existing cells
4. Different organelles have specific functions
5. Animal and plant cells have similarities and differences`,
      teacherId: teacher1.id
    }
  })

  const lesson3 = await prisma.lesson.upsert({
    where: { id: 'lesson-world-war-2' },
    update: {},
    create: {
      id: 'lesson-world-war-2',
      title: 'World War II: Causes and Consequences',
      subject: 'History',
      description: 'Understanding the major events, causes, and global impact of World War II.',
      content: `# World War II: Causes and Consequences

## Timeline
World War II lasted from 1939 to 1945, making it the deadliest conflict in human history.

## Major Causes

### Treaty of Versailles (1919)
- Ended World War I
- Placed harsh penalties on Germany
- Created economic hardship and resentment
- Redrew European boundaries

### Rise of Totalitarian Regimes
- Germany: Adolf Hitler and Nazi Party
- Italy: Benito Mussolini and Fascism
- Japan: Military expansionism

### Economic Depression
- Great Depression of 1929
- Global economic crisis
- High unemployment
- Created conditions for extremist leaders

### Failed Diplomacy
- League of Nations proved ineffective
- Policy of appeasement failed
- Munich Agreement (1938)

## Key Events

### Start of War (1939)
- September 1, 1939: Germany invades Poland
- Britain and France declare war on Germany

### European Theater
- Fall of France (1940)
- Battle of Britain (1940)
- Operation Barbarossa - invasion of Soviet Union (1941)
- D-Day - Allied invasion of Normandy (1944)

### Pacific Theater
- December 7, 1941: Pearl Harbor attack
- United States enters the war
- Island-hopping campaign
- Atomic bombs on Hiroshima and Nagasaki (1945)

## Major Powers

### Allied Powers
- United States
- Soviet Union
- United Kingdom
- France
- China

### Axis Powers
- Germany
- Italy
- Japan

## Consequences

### Human Cost
- Estimated 70-85 million deaths
- 6 million Jews killed in Holocaust
- Millions of civilians displaced

### Political Changes
- United Nations founded (1945)
- Cold War begins
- Decolonization accelerates
- Germany divided

### Technological Advances
- Nuclear weapons
- Radar and jet engines
- Computers and codebreaking
- Medical advances

## Legacy
- Shaped modern international relations
- Led to creation of international institutions
- Established human rights principles
- Changed global power balance

## Important Lessons
1. The dangers of totalitarianism
2. Importance of international cooperation
3. Never forget the Holocaust
4. Value of democracy and human rights`,
      teacherId: teacher2.id
    }
  })

  const lesson4 = await prisma.lesson.upsert({
    where: { id: 'lesson-newton-laws' },
    update: {},
    create: {
      id: 'lesson-newton-laws',
      title: "Newton's Laws of Motion",
      subject: 'Physics',
      description: 'Understanding the three fundamental laws that govern motion and their applications.',
      content: `# Newton's Laws of Motion

## Introduction
Sir Isaac Newton formulated three laws that describe the relationship between forces and motion. These laws are fundamental to classical mechanics.

## Newton's First Law: Law of Inertia

### Statement
"An object at rest stays at rest, and an object in motion stays in motion with the same speed and direction, unless acted upon by an unbalanced force."

### Key Concept: Inertia
- Inertia is the tendency of an object to resist changes in motion
- Mass is a measure of inertia
- More mass = more inertia

### Examples
- A book on a table stays at rest until you push it
- A hockey puck glides on ice until friction stops it
- Passengers lurch forward when a car brakes suddenly

## Newton's Second Law: F = ma

### Statement
"The acceleration of an object depends on the mass of the object and the amount of force applied."

### Formula
F = ma
- F = Force (Newtons, N)
- m = mass (kilograms, kg)
- a = acceleration (meters per second squared, m/s²)

### Key Points
- Force and acceleration are directly proportional
- Mass and acceleration are inversely proportional
- Direction of acceleration is same as direction of force

### Example Problem
A 10 kg object is pushed with a force of 50 N. What is its acceleration?

Solution:
F = ma
50 N = (10 kg)(a)
a = 50 ÷ 10
a = 5 m/s²

## Newton's Third Law: Action-Reaction

### Statement
"For every action, there is an equal and opposite reaction."

### Key Points
- Forces always come in pairs
- Action and reaction forces are equal in magnitude
- They act on different objects
- They act in opposite directions

### Examples
- When you push a wall, the wall pushes back with equal force
- A rocket pushes gas downward; gas pushes rocket upward
- When swimming, you push water backward; water pushes you forward
- When walking, you push ground backward; ground pushes you forward

## Applications

### Sports
- Baseball: bat force on ball = ball force on bat
- Swimming: push water to move forward
- Running: push ground to accelerate

### Transportation
- Rockets and jet engines
- Car acceleration and braking
- Bicycle motion

### Daily Life
- Opening doors
- Lifting objects
- Jumping

## Important Reminders
1. All three laws work together to explain motion
2. Forces are vectors (have magnitude and direction)
3. Net force determines acceleration
4. Without friction, objects would move forever
5. Understanding forces helps predict motion`,
      teacherId: teacher2.id
    }
  })

  console.log('Created sample lessons')
  console.log('\n=== Seed Complete ===')
  console.log('\nTest Accounts Created:')
  console.log('\nDefault Admin/Teacher:')
  console.log('Email: john@doe.com')
  console.log('Password: johndoe123')
  console.log('\nTeacher Account 1:')
  console.log('Email: teacher@sahayak.com')
  console.log('Password: teacher123')
  console.log('\nTeacher Account 2:')
  console.log('Email: david.chen@sahayak.com')
  console.log('Password: teacher123')
  console.log('\nStudent Account 1:')
  console.log('Email: student@sahayak.com')
  console.log('Password: student123')
  console.log('\nStudent Account 2:')
  console.log('Email: alex.kumar@sahayak.com')
  console.log('Password: student123')
  console.log('\n===================\n')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
