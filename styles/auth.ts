import {StyleSheet} from "react-native";

export const auth = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        color: "#000",
        marginBottom: 30,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#d9d9d9",
        borderRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginVertical: 10,
        height: 60,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: "700",
        color: "#000",
    },
    inputField: {
        flex: 1,
        textAlign: "right",
        fontSize: 16,
        fontWeight: "400",
        color: "#000",
        padding: 0,
        margin: 0,
    },
    text: {
        fontSize: 12,
        fontWeight: "700",
        color: "#B5B5B5",
        textAlign: "center",
        marginVertical: 15,
    },
    googleButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#d9d9d9",
        paddingVertical: 12,
        borderRadius: 30,
        marginBottom: 10,
        height: 60,
    },
    googleButtonText: {
        color: "#000",
        fontSize: 18,
        fontWeight: "700",
    },
    link: {
        marginVertical: 15,
    },
    textLink: {
        fontSize: 12,
        fontWeight: "700",
        color: "#818181",
        textAlign: "center",
    },
    button: {
        alignItems: "center",
    },
    buttonText: {
        color: "#000",
        fontSize: 32,
        fontWeight: "700",
    },
});