#include <stdio.h>
#include <ctype.h>
#include <string.h>

int isKeyword(char str[]) {
    char *keywords[] = {
        "int","float","char","double","if","else","while","for",
        "return","break","continue","void"
    };
    int n = sizeof(keywords)/sizeof(keywords[0]);
    for(int i = 0; i < n; i++)
        if(strcmp(str, keywords[i]) == 0)
            return 1;
    return 0;
}

int main() {
    char id[50];
    int valid = 1;

    printf("Enter identifier: ");
    fgets(id, sizeof(id), stdin);
    id[strcspn(id, "\n")] = '\0';  
    for(int i = 0; id[i]; i++) {
        if(id[i] == ' ') {
            valid = 0;
            break;
        }
    }

    if(!(isalpha(id[0]) || id[0] == '_'))
        valid = 0;

    for(int i = 1; id[i]; i++) {
        if(!(isalnum(id[i]) || id[i] == '_')) {
            valid = 0;
            break;
        }
    }

    if(isKeyword(id))
        valid = 0;

    if(valid)
        printf("Valid identifier\n");
    else
        printf("Invalid identifier\n");

    return 0;
}
