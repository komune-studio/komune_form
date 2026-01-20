export default function stringToArray(inputString: any) {
    if (!inputString) {
        return [];
    }

    //@ts-ignore
    return inputString.split(',').map(item => item.trim());
}