@FAQ.jsx 
У тебя есть секция "Часто задаваемые вопросы" (FAQ), и тебе нужно изменить её дизайн, используя компонент Accordion из shadcn/ui.
Get:/faq
[
    {
        "id": 3,
        "question": "Доступ предоставляется согласно рабочему времени склада. Для индивидуального доступа за пределами графика уточняйте у администратора.",
        "answer": "Доступ предоставляется согласно рабочему времени склада. Для индивидуального доступа за пределами графика уточняйте у администратора.",
        "type": "STORAGE"
    },
    {
        "id": 2,
        "question": "Мы принимаем оплату банковской картой, по безналичному расчёту и через мобильные платежи (Kaspi, Apple Pay и др.).",
        "answer": "Мы принимаем оплату банковской картой, по безналичному расчёту и через мобильные платежи (Kaspi, Apple Pay и др.).",
        "type": "PAYMENT"
    },
    {
        "id": 1,
        "question": "Мы предлагаем три типа хранения: облачное хранение, индивидуальные боксы и rack cloud для хранения на стеллажах.",
        "answer": "Мы предлагаем три типа хранения: облачное хранение, индивидуальные боксы и rack cloud для хранения на стеллажах.",
        "type": "STORAGE"
    },
    {
        "id": 4,
        "question": "Минимальный срок аренды — 1 месяц. Также доступны помесячные и годовые тарифы с гибкой системой скидок.",
        "answer": "Минимальный срок аренды — 1 месяц. Также доступны помесячные и годовые тарифы с гибкой системой скидок.",
        "type": "STORAGE"
    }
]

--
Installation
CLI
Manual
pnpm
npm
yarn
bun
npx shadcn@latest add accordion
Copy
Usage
Copy
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
Copy
<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>
      Yes. It adheres to the WAI-ARIA design pattern.
    </AccordionContent>
  </AccordionItem>
</Accordion>

--
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function AccordionDemo() {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      defaultValue="item-1"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>Product Information</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>
            Our flagship product combines cutting-edge technology with sleek
            design. Built with premium materials, it offers unparalleled
            performance and reliability.
          </p>
          <p>
            Key features include advanced processing capabilities, and an
            intuitive user interface designed for both beginners and experts.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Shipping Details</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>
            We offer worldwide shipping through trusted courier partners.
            Standard delivery takes 3-5 business days, while express shipping
            ensures delivery within 1-2 business days.
          </p>
          <p>
            All orders are carefully packaged and fully insured. Track your
            shipment in real-time through our dedicated tracking portal.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Return Policy</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>
            We stand behind our products with a comprehensive 30-day return
            policy. If you&apos;re not completely satisfied, simply return the
            item in its original condition.
          </p>
          <p>
            Our hassle-free return process includes free return shipping and
            full refunds processed within 48 hours of receiving the returned
            item.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}