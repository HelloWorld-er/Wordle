export default function Show({when, children, fallback = <></>}) {
    return (
        <>
            {when ? children : fallback}
        </>
    );
}