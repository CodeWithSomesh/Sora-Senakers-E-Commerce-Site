import Swal from 'sweetalert2'

const EmailSection = () => {
    const onSubmit = async (event:any) => {
        event.preventDefault();
        const formData = new FormData(event.target);
    
        /* Collects and formats the form data as JSON */
        formData.append("access_key", "068be0d2-a529-4e9e-be52-1d0fa797a21a");
    
        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);
    
        /* send the data to web API, to handle the submission */
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: json
        }).then((res) => res.json());
    
        /* if submission is succesfull, it shows a succes alert to user */
        if (res.success) {
            Swal.fire({
                title: "Success!",
                text: "Your message/question is sent succecfully. Check your emails in a while for our reply.\n Thank You & Have A Nice Day!",
                icon: "success"
              });
        }
    };

  return (
    <div>
        <h1 className='text-center border py-6 font-inter text-5xl font-bold italic text-white bg-violet2 mb-8 hover:text-black'>Contact Us</h1>

        <section className="flex justify-center items-center w-full">
        
            <form onSubmit={onSubmit} className="w-full px-36  font-inter shadow-xl rounded-md pb-8">

                <div className="flex justify-between gap-8">
                    <div className="w-full">
                        <label className='font-semibold text-xl' htmlFor="">Name</label>
                        <input type="text" className="w-full h-[50px] border border-gray-400 rounded-md p-3 text-lg mt-2" placeholder="Enter Your Name" name="name" required />
                    </div>

                    <div className="w-full">
                        <label className='font-semibold text-xl' htmlFor="">Email Address</label>
                        <input type="text" className="w-full h-[50px] border border-gray-400 rounded-md p-3 text-lg mt-2" placeholder="Enter Your Email" name="email" required />
                    </div>
                </div>

                <div className="mt-8">
                    <label className='font-semibold text-xl' htmlFor="">Question/Message</label>
                    <textarea className="w-full h-[200px] block border border-gray-400 rounded-md p-3 text-lg mt-2" placeholder="Feel free to drop a message/question" name="message" required />
                </div>

                <button type="submit" className="w-full mt-6 py-4 rounded-md font-bold text-2xl font-inter bg-violet2 text-white hover:bg-black">Send</button>
            </form>
        </section>
    </div>
  )
}

export default EmailSection