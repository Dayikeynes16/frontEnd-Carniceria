import { useContext } from "react";
import { TarggetMet, Seeker, CloseX, ButtonDouble } from './';
import { MetContext } from "./context/metContext";

export const ContentMet = () => {
    // show is already filtered by MetProvider
    const { show } = useContext( MetContext );
    
    
    return (
        <div className="contentMetNone">

            <div className="contentMet">
                <div className="contentMetHeader">
                    <Seeker />
                    <div className="contentMetoptions">
                        <ButtonDouble />
                    </div>
                    <CloseX />
                </div>
                <div className="mets">
                { show.map((item, index) => (<TarggetMet key={`${item.id}-${index}`} met={item} />))}                
                </div>
            </div>
        </div>
    )
}
