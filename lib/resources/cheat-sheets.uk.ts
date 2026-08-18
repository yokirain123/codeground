import type { Locale } from "@/lib/i18n/config";

import { CHEAT_SHEETS, type CheatSheet } from "./cheat-sheets";

const sheetDescriptions: Record<string, string> = {
  html: "Створюй структуру сторінок за допомогою семантичної та доступної розмітки.",
  css: "Оформлюй адаптивні інтерфейси сучасними інструментами компонування.",
  javascript: "Працюй зі значеннями, колекціями, DOM та асинхронним кодом.",
  react: "Створюй повторно використовувані компоненти зі станом, ефектами й подіями.",
  python: "Пиши зрозумілі скрипти з колекціями, керуванням потоком і функціями.",
  csharp: "Створюй типізовані консольні програми .NET і повторно використовувані класи.",
  cpp: "Пиши переносний C++17 із контейнерами STL та безпечним володінням ресурсами.",
};

const sectionCopy: Record<string, { title: string; description: string }> = {
  "html:Page structure": {
    title: "Структура сторінки",
    description: "Основні будівельні блоки документа.",
  },
  "html:Forms & actions": {
    title: "Форми та дії",
    description: "Збирай дані за допомогою підписів і зрозумілих елементів керування.",
  },
  "html:Content patterns": {
    title: "Шаблони вмісту",
    description: "Поширені шаблони зображень, списків і розкривних елементів.",
  },
  "css:Selectors & variables": {
    title: "Селектори та змінні",
    description: "Обирай елементи та повторно використовуй значення дизайну.",
  },
  "css:Layout": {
    title: "Компонування",
    description: "Створюй одно- та двовимірні макети.",
  },
  "css:Responsive UI": {
    title: "Адаптивний UI",
    description: "Адаптуй шрифти й макет із повагою до налаштувань користувача.",
  },
  "javascript:Values & functions": {
    title: "Значення та функції",
    description: "Оголошуй дані та оформлюй повторно використовувану поведінку.",
  },
  "javascript:Arrays & objects": {
    title: "Масиви та об’єкти",
    description: "Перетворюй колекції, не змінюючи початкові дані.",
  },
  "javascript:Async & DOM": {
    title: "Асинхронність і DOM",
    description: "Завантажуй дані та взаємодій з елементами сторінки.",
  },
  "react:Components & props": {
    title: "Компоненти та props",
    description: "Розділяй інтерфейс на невеликі повторно використовувані частини.",
  },
  "react:State & events": {
    title: "Стан і події",
    description: "Зберігай інтерактивні значення у стані компонента.",
  },
  "react:Effects & derived data": {
    title: "Ефекти та похідні дані",
    description: "Синхронізуй зовнішні системи й обчислюй представлення.",
  },
  "python:Basics": {
    title: "Основи",
    description: "Зберігай значення, читай введення та форматуй вивід.",
  },
  "python:Collections": {
    title: "Колекції",
    description: "Зберігай і перетворюй групи значень.",
  },
  "python:Functions & errors": {
    title: "Функції та помилки",
    description: "Повторно використовуй логіку й обробляй очікувані помилки.",
  },
  "csharp:Console & types": {
    title: "Консоль і типи",
    description: "Читай введення та працюй зі строго типізованими значеннями.",
  },
  "csharp:Collections & LINQ": {
    title: "Колекції та LINQ",
    description: "Зберігай, фільтруй і впорядковуй дані.",
  },
  "csharp:Methods & classes": {
    title: "Методи та класи",
    description: "Групуй поведінку та захищай стан об’єктів.",
  },
  "cpp:Console & types": {
    title: "Консоль і типи",
    description: "Створи точку входу, прочитай введення та виведи результат.",
  },
  "cpp:Containers & loops": {
    title: "Контейнери та цикли",
    description: "Зберігай значення й безпечно перебирай їх.",
  },
  "cpp:Functions & ownership": {
    title: "Функції та володіння",
    description: "Ефективно передавай дані та безпечно керуй ресурсами.",
  },
};

const entryCopy: Record<string, { title: string; description: string }> = {
  "html-document": {
    title: "Каркас документа",
    description: "Мінімальна коректна HTML5-сторінка.",
  },
  "html-semantic-layout": {
    title: "Семантичний макет",
    description: "Змістовні орієнтири для користувачів і допоміжних технологій.",
  },
  "html-labeled-input": {
    title: "Поле з підписом",
    description: "Зв’яжи label та input однаковими атрибутами.",
  },
  "html-button": {
    title: "Типи кнопок",
    description: "Явно вказуй призначення кнопки всередині форми.",
  },
  "html-accessible-image": {
    title: "Доступне зображення",
    description: "Використовуй змістовний alt або порожній alt для декору.",
  },
  "html-details": {
    title: "Нативне розкриття",
    description: "Створюй розгортний вміст без JavaScript.",
  },
  "css-selectors": {
    title: "Корисні селектори",
    description: "Обирай за елементом, класом, станом і зв’язком.",
  },
  "css-custom-properties": {
    title: "CSS-змінні",
    description: "Визнач невелику повторно використовувану систему кольорів.",
  },
  "css-flexbox": {
    title: "Рядок Flexbox",
    description: "Вирівнюй елементи та розподіляй вільний простір.",
  },
  "css-grid": {
    title: "Адаптивна сітка",
    description: "Розміщуй стільки карток, скільки вміщує контейнер.",
  },
  "css-fluid-type": {
    title: "Гнучка типографіка",
    description: "Масштабуй текст між безпечними мінімальним і максимальним розмірами.",
  },
  "css-reduced-motion": {
    title: "Зменшення руху",
    description: "Вимикай необов’язкову анімацію на запит користувача.",
  },
  "js-variables": {
    title: "Змінні",
    description: "Віддавай перевагу const; використовуй let лише для переприсвоєння.",
  },
  "js-functions": {
    title: "Шаблони функцій",
    description: "Два поширені способи оголосити функцію.",
  },
  "js-array-methods": {
    title: "Методи масивів",
    description: "Фільтруй, перетворюй та об’єднуй значення.",
  },
  "js-spread": {
    title: "Синтаксис spread",
    description: "Створюй оновлені копії масивів та об’єктів.",
  },
  "js-fetch": {
    title: "Отримання JSON",
    description: "Обробляй HTTP-помилки до читання відповіді.",
  },
  "js-dom-event": {
    title: "Подія DOM",
    description: "Знайди елемент і відреагуй на дію користувача.",
  },
  "react-component": {
    title: "Типізований компонент",
    description: "Отримуй дані лише для читання через props.",
  },
  "react-list": {
    title: "Рендер списку",
    description: "Використовуй стабільний key для кожного елемента.",
  },
  "react-state": {
    title: "useState",
    description: "Оновлюй стан на основі його попереднього значення.",
  },
  "react-controlled-input": {
    title: "Кероване поле",
    description: "Синхронізуй значення форми зі станом React.",
  },
  "react-effect": {
    title: "Очищення ефекту",
    description: "Підпишися один раз і виконай очищення під час демонтування.",
  },
  "react-derived-data": {
    title: "Похідні дані",
    description: "Обчислюй відфільтрований результат замість зберігання копії.",
  },
  "python-io": {
    title: "Введення та виведення",
    description: "Прочитай текст, перетвори числа та виведи результат.",
  },
  "python-condition": {
    title: "Умова",
    description: "Обирай шлях за допомогою if, elif та else.",
  },
  "python-list-comprehension": {
    title: "List comprehension",
    description: "Фільтруй і перетворюй список в одному виразі.",
  },
  "python-dictionary": {
    title: "Словник",
    description: "Зберігай іменовані значення та отримуй їх за ключем.",
  },
  "python-function": {
    title: "Типізована функція",
    description: "Документуй типи параметрів і поверненого значення.",
  },
  "python-exception": {
    title: "Обробка винятків",
    description: "Перехоплюй лише ту помилку, яку очікуєш.",
  },
  "csharp-io": {
    title: "Консольне введення",
    description: "Прочитай рядок і безпечно перетвори його на число.",
  },
  "csharp-variables": {
    title: "Змінні та константи",
    description: "Свідомо використовуй явні типи, var і const.",
  },
  "csharp-list": {
    title: "Узагальнений список",
    description: "Створюй і оновлюй колекцію зі змінним розміром.",
  },
  "csharp-linq": {
    title: "Ланцюжок LINQ",
    description: "Фільтруй і сортуй, не змінюючи початковий список.",
  },
  "csharp-method": {
    title: "Метод",
    description: "Приймай параметри та повертай типізований результат.",
  },
  "csharp-class": {
    title: "Невеликий клас",
    description: "Ініціалізуй стан і надавай контрольовану поведінку.",
  },
  "cpp-program": {
    title: "Консольна програма",
    description: "Мінімальна переносна програма C++17.",
  },
  "cpp-variables": {
    title: "Змінні та const",
    description: "Використовуй автоматичне виведення типів і незмінні значення.",
  },
  "cpp-vector": {
    title: "std::vector",
    description: "Створюй, розширюй і перебирай динамічний масив.",
  },
  "cpp-algorithm": {
    title: "Алгоритм STL",
    description: "Шукай у колекції без написання ручного циклу.",
  },
  "cpp-const-reference": {
    title: "Посилання const",
    description: "Уникай копіювання та водночас забороняй зміну.",
  },
  "cpp-unique-ptr": {
    title: "unique_ptr",
    description: "Надай одному власнику автоматичне звільнення ресурсу.",
  },
};

export function getCheatSheets(locale: Locale): CheatSheet[] {
  if (locale === "en") {
    return CHEAT_SHEETS;
  }

  return CHEAT_SHEETS.map((sheet) => ({
    ...sheet,
    description: sheetDescriptions[sheet.slug] ?? sheet.description,
    sections: sheet.sections.map((section) => {
      const sectionTranslation = sectionCopy[`${sheet.slug}:${section.title}`];

      return {
        ...section,
        title: sectionTranslation?.title ?? section.title,
        description: sectionTranslation?.description ?? section.description,
        entries: section.entries.map((entry) => ({
          ...entry,
          ...(entryCopy[entry.id] ?? {}),
        })),
      };
    }),
  }));
}
