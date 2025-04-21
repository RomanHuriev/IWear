import {StyleSheet} from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: "#fff",
        paddingTop: 100,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 20,
        right: 46,
        marginBottom: 24,
    },
    gridContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        backgroundColor: "#e1e1e1",
        borderRadius: 10,
        overflow: "hidden",
    },
    item: {
        backgroundColor: "#e1e1e1",
        justifyContent: "center",
        alignItems: "center",
        borderColor: "white",
        borderWidth: 1,
    },
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#d9d9d9",
        borderRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 12,
        margin: 10,
        height: 60,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    inputShadow: {
        backgroundColor: '#d9d9d9',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    gradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
    },
    inputField: {
        flex: 1,
        textAlign: "center",
        fontSize: 16,
        fontWeight: "400",
        color: "#000",
        padding: 0,
        margin: 0,
    },
    buttonContainer:{
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        alignItems: 'center',
    },
    buttonText: {
        color: "#000",
        fontSize: 32,
        fontWeight: "700",
        justifyContent: 'center',
    },
    carouselContainer: {
        alignItems: 'center',
        paddingHorizontal: 10,
      },
      paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 15,
      },
      paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 5,
      },
      activeDot: {
        backgroundColor: '#000',
      },
      inactiveDot: {
        backgroundColor: '#CCCCCC',
      },

});