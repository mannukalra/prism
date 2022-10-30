import data from "./Config.json";


function Prism(props) {

    const config = data[props.page]

    return (
        <div>
            Welcome to {config.label}
        </div>
    );
}

export default Prism;
