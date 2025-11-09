import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

// Define the props type
type CounterProps = {
  quantity: number;
  setQuantity?: React.Dispatch<React.SetStateAction<number>>;
};

export default function Counter({ quantity, setQuantity }: CounterProps) {
  const [count, setCount] = React.useState(quantity);
  
  React.useEffect(() => {
    if (setQuantity) {
      setQuantity(count);
    }
  }, [count, setQuantity]);

  return (
    <div className='flex h-[38px]'>                          
        <Button className='  border border-black rounded-t-sm rounded-tr-none rounded-b-sm rounded-br-none h-full'
        onClick={() => {
            setCount(Math.max(count - 1, 0));
            }} >
            <Minus width={20} />
        </Button>

        <Button className=' border border-black rounded-none h-[px]' >
            {count}
        </Button>

        <Button className='  border border-black rounded-sm rounded-b-sm rounded-l-none h-full' 
        onClick={() => {
            setCount(count + 1);
            }}>
            <Plus width={20}  />
        </Button>
    </div> 

  );
}
