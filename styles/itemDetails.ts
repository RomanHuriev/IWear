import {StyleSheet} from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        paddingTop: 70,
    },
    backButton: {
        position: 'absolute',
        top: 20,
        right: 46,
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#000",
        marginVertical: 15,
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
    selectedColor: {
        flex: 1,
        textAlign: "right",
        fontSize: 16,
        fontWeight: "400",
        color: "#000",
    },
    pickerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        flex: 1,
        gap: 10,
    },
    selectedValue: {
        fontSize: 16,
        fontWeight: "400",
        color: "#000",
    },
    picker: {
        position: "absolute",
        opacity: 0,
        width: "100%",
        height: "100%",
    },
    buttonContainer:{
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        position: 'absolute',
    },
});