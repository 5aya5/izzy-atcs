// Схема формы для генерации акта
// FORM_SECTIONS — массив секций с полями, их метаданными и валидацией
// Используется для динамического рендеринга формы и подсказок

export const FORM_SECTIONS = [
  {
    id: "contract",
    title: "Договор",
    columns: 3,
    fields: [
      { name: "docNum", label: "Номер договора", required: true,
        placeholder: "Напр.: 123/А", help: "Указывается номер согласно договору.",
        validate: v => !!v && v.length <= 50 || "Обязательное поле (до 50 символов)" },
      { name: "docDay", label: "День заключения", required: true,
        placeholder: "01–31", help: "День даты заключения договора.", inputMode: 'numeric', mask: '99',
        validate: v => /^\d{1,2}$/.test(v) || "Введите число 1–31" },
      { name: "docMonth", label: "Месяц заключения", required: true,
        placeholder: "01–12", help: "Месяц даты заключения договора.", inputMode: 'numeric', mask: '99',
        validate: v => /^\d{1,2}$/.test(v) || "Введите число 1–12" },
      { name: "docYear", label: "Год заключения", required: true,
        placeholder: "ГГГГ", help: "Год заключения (4 цифры)", inputMode: 'numeric', mask: '9999',
        validate: v => /^\d{4}$/.test(v) || "Введите 4 цифры" }
    ]
  },
  {
    id: "actDate",
    title: "Дата акта",
    columns: 3,
    fields: [
      { name: "day", label: "День", required: true, placeholder: "01–31", help: "День акта." },
      { name: "month", label: "Месяц", required: true, placeholder: "01–12", help: "Месяц акта.", inputMode: 'numeric', mask: '99' },
      { name: "year", label: "Год", required: true, placeholder: "ГГГГ", help: "Год акта (4 цифры).", inputMode: 'numeric', mask: '9999' }
    ]
  },
  {
    id: "partyService",
    title: "Стороны и услуга",
    columns: 2,
    fields: [
      { name: "fullName", label: "Полное имя", required: true,
        placeholder: "Иванов Иван Иванович", help: "ФИО контрагента полностью." },
      { name: "shortName", label: "Фамилия И.О.", required: true,
        placeholder: "Иванов И.И.", help: "Фамилия и инициалы." },
      { name: "typeServices", label: "Услуга", required: true,
        placeholder: "Напр.: Доставка/Чарджинг", help: "Коротко опишите услугу." }
    ]
  },
  {
    id: "amounts",
    title: "Суммы",
    columns: 2,
    fields: [
      { name: "amount", label: "Полная стоимость", required: true,
        placeholder: "Напр.: 1 500 000", help: "Итоговая стоимость по договору.", inputMode: 'numeric' },
      { name: "amountWords", label: "Полная стоимость (прописью)", required: true,
        placeholder: "Один миллион пятьсот тысяч сум", help: "Юр.точность важна — проверьте текст." },
      { name: "paymentAmount", label: "Сумма оплаты", required: true,
        placeholder: "Напр.: 1 200 000", help: "Сумма к выплате по акту.", inputMode: 'numeric' },
      { name: "paymentAmountWords", label: "Сумма оплаты (прописью)", required: true,
        placeholder: "Один миллион двести тысяч сум", help: "Должно соответствовать цифрам." }
    ]
  },
  {
    id: "passport",
    title: "Паспорт и адрес",
    columns: 3,
    fields: [
      { name: "passport", label: "Паспорт (серия и номер)", required: true,
        placeholder: "AA1234567", help: "Серия и номер документа." },
      { name: "issDay", label: "День выдачи", required: true, placeholder: "01–31", help: "День выдачи паспорта.", inputMode: 'numeric', mask: '99' },
      { name: "issMonth", label: "Месяц выдачи", required: true, placeholder: "01–12", help: "Месяц выдачи паспорта.", inputMode: 'numeric', mask: '99' },
      { name: "issYear", label: "Год выдачи", required: true, placeholder: "ГГГГ", help: "Год выдачи паспорта (4 цифры).", inputMode: 'numeric', mask: '9999' },
      { name: "address", label: "Адрес", required: true,
        placeholder: "Город, улица, дом", help: "Фактический адрес проживания." }
    ]
  },
  {
    id: "bank",
    title: "Банковские данные",
    columns: 3,
    fields: [
      { name: "pinfl", label: "ПИНФЛ", required: true,
        placeholder: "14 цифр", help: "Идентификационный номер физ.лица (14 цифр).", inputMode: 'numeric', mask: '99999999999999' },
      { name: "bankCard", label: "Банковская карта", required: true,
        placeholder: "16 цифр", help: "Номер карты для зачисления.", inputMode: 'numeric', mask: '9999 9999 9999 9999' },
      { name: "bankName", label: "Банк", required: true,
        placeholder: "Название банка", help: "Название обслуживающего банка." }
    ]
  },
  {
    id: "advanced",
    title: "Дополнительно",
    columns: 3,
    optional: true,
    fields: [
      { name: "docDateStart", label: "Дата начала договора", placeholder: "ДД.ММ.ГГГГ", help: "Если требуется шаблоном." },
      { name: "servicesDateStart", label: "Дата начала услуги", placeholder: "ДД.ММ.ГГГГ", help: "Если требуется шаблоном.", mask: '99.99.9999' },
      { name: "transitAccount", label: "Транзитный счёт", placeholder: "Номер счёта", help: "Если требуется шаблоном." },
      { name: "mfo", label: "МФО", placeholder: "Код банка", help: "Если требуется шаблоном." },
      { name: "tin", label: "ИНН", placeholder: "9 цифр", help: "Если требуется шаблоном." },
      { name: "issDate", label: "Дата выдачи (цельная)", placeholder: "ДД.ММ.ГГГГ", help: "Альтернатива issDay/issMonth/issYear.", mask: '99.99.9999' },
      { name: "totalShifts", label: "Кол-во смен", placeholder: "Напр.: 12", help: "Для шаблонов со сменами." },
      { name: "byRate", label: "Ставка", placeholder: "Напр.: 100 000", help: "Ставка за смену/работу." },
      { name: "byRateQuantity", label: "Кол-во по ставке", placeholder: "Напр.: 5", help: "Штук/смен по ставке." },
      { name: "fullShiftsRate", label: "Ставка за полную смену", placeholder: "Напр.: 150 000", help: "Если есть в шаблоне." },
      { name: "numSubstitutions", label: "Замены/подмены", placeholder: "Напр.: 2", help: "Если требуется." },
      { name: "paymentByCustomer", label: "Оплата заказчиком", placeholder: "Цифрами", help: "Если шаблон просит разделять." },
      { name: "paymentByCustomerWords", label: "Оплата заказчиком (прописью)", placeholder: "Текст", help: "Соответствует цифрам." },
      { name: "toolCost", label: "Стоимость инструмента", placeholder: "Цифрами", help: "Для депозита/инструмента." },
      { name: "toolCostWords", label: "Стоимость инструмента (прописью)", placeholder: "Текст", help: "Соответствует цифрам." },
      { name: "shiftsOfThem", label: "Из них смен", placeholder: "Напр.: 3", help: "Если в шаблоне есть 'shiftsOf Them'." }
    ]
  }
]
