import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
  

const FAQ = () => {
  return (
    <div className="mb-12">
        <h1 className='text-center border py-6 font-inter text-5xl font-bold italic text-violet3 bg-black mb-8 hover:text-white'>FAQs</h1>
        <Accordion type="single" collapsible className="w-[80%] mx-auto">
            <AccordionItem value="item-1" className="mb-3">
                <AccordionTrigger className="text-2xl">How can I contact SoRa?</AccordionTrigger>
                <AccordionContent className="text-xl">
                    You can contact us through email at hello@sora.co or Instagram. 
                    We will get in touch in you within 24-48 hours. Alternatively, you can call our store at +60364113523 or Whatsapp us at +60162390405.
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="mb-3">
                <AccordionTrigger className="text-2xl">Are your products authentic?</AccordionTrigger>
                <AccordionContent className="text-xl">
                    All our products are guaranteed 100% authentic with their box/accessories of origin (if there are any). Read our authenticity assurance in our app.
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="mb-3">
                <AccordionTrigger className="text-2xl">Why do some items differ in price according to size?</AccordionTrigger>
                <AccordionContent className="text-xl">
                    At SoRa, you're shopping from top brands worldwide. We have a curated a range for you to choose from. 
                    Sometimes the same item's price varies in the streetwear and sneaker marketplace, depending on the availability. 
                    Our promise to you is to always offer the best price available at the time you place an order.
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="mb-3">
                <AccordionTrigger className="text-2xl">Do you offer same day delivery?</AccordionTrigger>
                <AccordionContent className="text-xl">
                    Yes, we offer same day delivery for areas in Penang, both mainland and the island, via Grab which offers a safe, fast, and reliable same-day delivery. 
                    Please Whatsapp us at +60162390405 before placing an order to arrange the same day delivery service and we will do our best to sort you out!
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="mb-3">
                <AccordionTrigger className="text-2xl">Do you ship internationally?</AccordionTrigger>
                <AccordionContent className="text-xl">
                    Yes, we do. We ship to over 220 countries using reliable courier services such as Aramex, TNT, DHL and FedEx. 
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="mb-3">
                <AccordionTrigger className="text-2xl">What do you use to ship locally?</AccordionTrigger>
                <AccordionContent className="text-xl">
                    We ship locally via Poslaju, DHL eCommerce, CityLink or J&T Express, depending on your parcel size and weight. 
                    If you prefer a specific courier company, do leave us a note in WhatsApp at +60162390405!
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7" className="mb-3">
                <AccordionTrigger className="text-2xl">How much will I be charged for shipping?</AccordionTrigger>
                <AccordionContent className="text-xl">
                    This varies depending on the size, weight and destination of your chosen items. 
                    The good news is we offer free shipping to Malaysia & Singapore on orders above RM250!
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8" className="mb-3">
                <AccordionTrigger className="text-2xl">How do I track my order?</AccordionTrigger>
                <AccordionContent className="text-xl">
                    You can track order via shipping confirmation email containing the tracking number and courier details. 
                    The status of the shipment could also be checked on the order page.
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-9" className="mb-3">
                <AccordionTrigger className="text-2xl">Can I reserve an item to buy later?</AccordionTrigger>
                <AccordionContent className="text-xl">
                    We aim to provide a fair opportunity to shop our most in-demand styles and as items are often limited, we don't offer reservations.
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-10" className="">
                <AccordionTrigger className="text-2xl">Do you accept returns?</AccordionTrigger>
                <AccordionContent className="text-xl">
                    Returns may not be always possible. 
                    However, under some specific conditions, we may accept returns. 
                    To request a return you can contact us by email at hello@sora.co. For more information, see our return & refund policy.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
    
  )
}

export default FAQ