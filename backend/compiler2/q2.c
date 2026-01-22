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
    FILE *fp;
    char ch, buffer[20];
    int i = 0;

    fp = fopen("input.c", "r");
    if(fp == NULL) {
        printf("File not found\n");
        return 0;
    }

    while((ch = fgetc(fp)) != EOF) {


        if(strchr("+-*/=%", ch)) {
            printf("Operator: %c\n", ch);
        }


        if(isalpha(ch) || ch == '_') {
            buffer[i++] = ch;
            while(isalnum(ch = fgetc(fp)) || ch == '_')
                buffer[i++] = ch;

            buffer[i] = '\0';
            i = 0;

            if(isKeyword(buffer))
                printf("Keyword: %s\n", buffer);
            else
                printf("Identifier: %s\n", buffer);
        }
    }

    fclose(fp);
    return 0;
}