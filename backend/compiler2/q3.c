#include <stdio.h>

int main() {
    FILE *fp;
    char ch;
    int spaces = 0, lines = 0, characters = 0;

    fp = fopen("input.txt", "r");
    if(fp == NULL) {
        printf("File not found\n");
        return 0;
    }

    while((ch = fgetc(fp)) != EOF) {
        characters++;

        if(ch == ' ')
            spaces++;
        if(ch == '\n')
            lines++;
    }

    fclose(fp);

    printf("Characters: %d\n", characters);
    printf("Spaces: %d\n", spaces);
    printf("Lines: %d\n", lines);

    return 0;
}