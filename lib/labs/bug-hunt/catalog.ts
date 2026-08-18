import type { Locale } from "@/lib/i18n/config";

import type { RunnableLabLanguage } from "../types";

export interface BugHuntMission {
  slug: string;
  title: string;
  description: string;
  language: RunnableLabLanguage;
  difficulty: "Easy" | "Medium" | "Hard";
  xp: number;
  hintCost: number;
  expectedOutput: string;
  hint: string;
  filename: string;
  starterCode: string;
}

export const bugHuntMissions: BugHuntMission[] = [
  {
    slug: "javascript-off-by-one",
    title: "One Step Too Far",
    description:
      "The inventory loop walks beyond the final item and corrupts the total.",
    language: "javascript",
    difficulty: "Easy",
    xp: 50,
    hintCost: 15,
    expectedOutput: "Total: 15",
    hint: "An array with five items has valid indexes from 0 through 4.",
    filename: "mission.js",
    starterCode: `const numbers = [1, 2, 3, 4, 5];
let total = 0;

for (let index = 0; index <= numbers.length; index += 1) {
  total += numbers[index];
}

console.log(\`Total: \${total}\`);`,
  },
  {
    slug: "javascript-discount",
    title: "The 900% Discount",
    description:
      "A percentage formula turns a small discount into a catastrophic one.",
    language: "javascript",
    difficulty: "Medium",
    xp: 70,
    hintCost: 20,
    expectedOutput: "Final price: 180",
    hint: "A percentage is a value out of one hundred, not out of ten.",
    filename: "discount.js",
    starterCode: `const price = 200;
const discount = 10;
const finalPrice = price - (price * discount) / 10;

console.log(\`Final price: \${finalPrice}\`);`,
  },
  {
    slug: "python-lost-accumulator",
    title: "The Forgetful Counter",
    description:
      "The total forgets every number except the last one in the list.",
    language: "python",
    difficulty: "Easy",
    xp: 50,
    hintCost: 15,
    expectedOutput: "Total: 15",
    hint: "The loop should add to the existing total instead of replacing it.",
    filename: "mission.py",
    starterCode: `numbers = [1, 2, 3, 4, 5]
total = 0

for number in numbers:
    total = number

print(f"Total: {total}")`,
  },
  {
    slug: "python-missing-item",
    title: "The Missing Multiplier",
    description: "The loop stops early and ignores the final value.",
    language: "python",
    difficulty: "Medium",
    xp: 70,
    hintCost: 20,
    expectedOutput: "Product: 24",
    hint: "The stop value passed to range is already excluded.",
    filename: "product.py",
    starterCode: `values = [1, 2, 3, 4]
product = 1

for index in range(len(values) - 1):
    product *= values[index]

print(f"Product: {product}")`,
  },
  {
    slug: "csharp-backwards-operator",
    title: "Backwards Assignment",
    description: "A tiny operator typo resets the lives instead of adding them.",
    language: "csharp",
    difficulty: "Easy",
    xp: 60,
    hintCost: 15,
    expectedOutput: "Lives: 5",
    hint: "The addition-assignment operator places the plus sign first.",
    filename: "Program.cs",
    starterCode: `using System;

public class Program
{
    public static void Main()
    {
        int lives = 3;
        int bonus = 2;
        lives =+ bonus;

        Console.WriteLine($"Lives: {lives}");
    }
}`,
  },
  {
    slug: "csharp-integer-average",
    title: "The Rounded Average",
    description: "Integer division silently removes the decimal part.",
    language: "csharp",
    difficulty: "Medium",
    xp: 80,
    hintCost: 20,
    expectedOutput: "Average: 2.5",
    hint: "Convert either side of the division to double before dividing.",
    filename: "Program.cs",
    starterCode: `using System;

public class Program
{
    public static void Main()
    {
        int[] values = { 2, 3 };
        int sum = values[0] + values[1];
        double average = sum / values.Length;

        Console.WriteLine($"Average: {average}");
    }
}`,
  },
  {
    slug: "cpp-assignment-condition",
    title: "Perfect by Accident",
    description: "The condition changes the score instead of comparing it.",
    language: "cpp",
    difficulty: "Easy",
    xp: 60,
    hintCost: 15,
    expectedOutput: "Keep going",
    hint: "Comparison needs two equals signs.",
    filename: "main.cpp",
    starterCode: `#include <iostream>

int main()
{
    int score = 90;

    if (score = 100)
    {
        std::cout << "Perfect" << std::endl;
    }
    else
    {
        std::cout << "Keep going" << std::endl;
    }

    return 0;
}`,
  },
  {
    slug: "cpp-vector-boundary",
    title: "Beyond the Vector",
    description: "The loop reads one element past the vector boundary.",
    language: "cpp",
    difficulty: "Medium",
    xp: 80,
    hintCost: 20,
    expectedOutput: "Total: 10",
    hint: "The vector size is a count, while the last index is size minus one.",
    filename: "main.cpp",
    starterCode: `#include <iostream>
#include <vector>

int main()
{
    std::vector<int> values = { 1, 2, 3, 4 };
    int total = 0;

    for (std::size_t index = 0; index <= values.size(); ++index)
    {
        total += values[index];
    }

    std::cout << "Total: " << total << std::endl;
    return 0;
}`,
  },
];

const ukrainianMissionCopy: Record<
  string,
  Pick<BugHuntMission, "title" | "description" | "hint">
> = {
  "javascript-off-by-one": {
    title: "На один крок далі",
    description:
      "Цикл інвентарю виходить за межі останнього елемента та псує суму.",
    hint: "Масив із п’яти елементів має допустимі індекси від 0 до 4.",
  },
  "javascript-discount": {
    title: "Знижка 900%",
    description:
      "Формула відсотків перетворює невелику знижку на катастрофічну.",
    hint: "Відсоток — це частка від ста, а не від десяти.",
  },
  "python-lost-accumulator": {
    title: "Забудькуватий лічильник",
    description: "Сума забуває всі числа списку, крім останнього.",
    hint: "Цикл має додавати до наявної суми, а не замінювати її.",
  },
  "python-missing-item": {
    title: "Загублений множник",
    description: "Цикл завершується зарано та ігнорує останнє значення.",
    hint: "Кінцеве значення, передане до range, уже не входить у діапазон.",
  },
  "csharp-backwards-operator": {
    title: "Оператор навпаки",
    description: "Крихітна помилка в операторі скидає життя замість додавання.",
    hint: "В операторі додавання з присвоєнням знак плюс стоїть першим.",
  },
  "csharp-integer-average": {
    title: "Округлене середнє",
    description: "Цілочисельне ділення непомітно відкидає дробову частину.",
    hint: "Перед діленням перетвори один із його операндів на double.",
  },
  "cpp-assignment-condition": {
    title: "Ідеально випадково",
    description: "Умова змінює рахунок замість того, щоб порівняти його.",
    hint: "Для порівняння потрібні два знаки дорівнює.",
  },
  "cpp-vector-boundary": {
    title: "За межами вектора",
    description: "Цикл читає один елемент за межами вектора.",
    hint: "Розмір вектора — це кількість елементів, а останній індекс дорівнює size мінус один.",
  },
};

export function getBugHuntMissions(locale: Locale = "en") {
  if (locale === "en") {
    return bugHuntMissions;
  }

  return bugHuntMissions.map((mission) => ({
    ...mission,
    ...ukrainianMissionCopy[mission.slug],
  }));
}

export function getBugHuntMission(slug: string, locale: Locale = "en") {
  return getBugHuntMissions(locale).find((mission) => mission.slug === slug);
}
