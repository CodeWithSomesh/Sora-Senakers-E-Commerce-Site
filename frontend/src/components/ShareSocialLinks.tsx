import {
    FacebookShareButton, FacebookIcon,
    TelegramShareButton, TelegramIcon,
    TwitterShareButton, TwitterIcon,
    WhatsappShareButton, WhatsappIcon
  } from "react-share";

const ShareSocialLinks = () => {
 
   
  const currentPageURL = window.location.href

  return (
    <div className="sm:flex sm:gap-3 h-[50px]">
        <div className="flex sm:gap-3 gap-14">
            {/* Twitter Button */}
            <TwitterShareButton 
                url={`${'\n'} ${'\n'} ${currentPageURL} ${'\n'} ${'\n'}`} 
                className="hover:scale-125" 
                hashtags={['SneakerLovers', 'MustHaveSneakers', 'SneakerSale', 'CheckTheseOut']}
                title={`👟 Check out this awesome sneaker I found on SneakerHub! It is stylish and comfortable. Don't miss out, grab yours now! ${' '}`}
            >
                <TwitterIcon round={true} size={46} />
            </TwitterShareButton>

            {/* Telegram Button */}
            <TelegramShareButton 
                url={currentPageURL} 
                className="hover:scale-125"
                title={`Hey! Just found this amazing sneaker on SneakerHub and I think you'll love it too! 🏃‍♂️💨 Its perfect for any occasion. Get yours now!`}
            >
                <TelegramIcon round={true} size={46} />
            </TelegramShareButton>
        </div>

        <div className="flex sm:gap-3 gap-14 mt-4 sm:mt-0">
            {/* Facebook Button */}
            <FacebookShareButton 
                url={currentPageURL}
                className="hover:scale-125"
            >
                <FacebookIcon round={true} size={46} />
            </FacebookShareButton>

            {/* WhatsApp Button */}
            <WhatsappShareButton 
                url={`${currentPageURL} ${'\n'} ${'\n'}`} 
                className="hover:scale-125"
                title={`Check out this cool sneaker I found on SneakerHub! 🏆 It looks great and feel even better. Can't wait to wear it! 🥳 ${'\n\n'}Get your pair here:${'\n\n'}`}
            >
                <WhatsappIcon round={true} size={46} />
            </WhatsappShareButton>
        </div>
    </div>

  )
}

export default ShareSocialLinks
