import { Typography } from "antd";
import "./GlobalView.css";
import Grid from "../../components/grid/Grid";

const GlobalView = () => {
    return(
        <div className="global-view-container">
            <Typography.Title level={3}>Global View</Typography.Title>
            <Grid/>
        </div>
    )
}

export default GlobalView;