import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@onysnow/ui/accordion";

export default function AccordionDemo() {
  return (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="a">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>Built on Radix: keyboard, focus and ARIA are handled.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Can I restyle it?</AccordionTrigger>
        <AccordionContent>Every part takes className; themes change the tokens.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
