import { BoxMain } from "./BoxMain";
import { NavMain } from "./NavMain";
import { useContext, useState } from "react";
import { ContentMet } from "./ContentMet";
import { MetContext } from "./context/metContext";
import { Loading } from "./Loading";
import { ContentAlerts } from './ContentAlerts';

export const MainMain = () => {

    const { screenMet, loading } = useContext( MetContext )

    return (
        <>
            {
                loading && <Loading />
            }

            <ContentAlerts />

            {
                screenMet &&  <ContentMet />
            }

            <NavMain />
            <BoxMain />
        </>
    )
}
