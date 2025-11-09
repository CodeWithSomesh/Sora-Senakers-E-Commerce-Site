import { Link } from "react-router-dom";

type Props = {
    total: number;
    color: string;
}

const SearchResultInfo = ({ total, color }: Props) => {
    return (
        <div className="text-xl font-bold flex flex-col gap-3 justify-between lg:items-center lg:flex-row">
            <span>
                {total} product(s) found in {color}
                <Link 
                to="/"
                className="ml-1 text-sm font-semibold underline cursor-pointer text-blue-500"
                >
                    Change
                </Link>
            </span>
        </div>
    )

}

export default SearchResultInfo; 